var request = require('request');
var YoBitAdapter = require('./YoBitAdapter.js'),
    LivecoinAdapter = require('./LivecoinAdapter'),
    LiquiAdapter = require('./LiquiAdapter'),
    KunaAdapter = require('./KunaAdapter'),
    BittrexAdapter = require('./BittrexAdapter')
    BTCEAdapter = require('./BTCEAdapter')
;
/**
 * This adapter mixes BTC/RUR and GOLOS/BTC exchanges
 */

var VirtualAdapter = {
    name: 'VirtualAdapter',
    provides: [
        ['golos','rur']
    ],
    get_pair: function(from,to,callback) {
        // if(['usd', 'eur', 'gbp', 'rub'].indexOf(to) == -1) {
        //     // btc-e is backwards for altcoins, so flip the pair!
        //     var tmp = to;
        //     to = from;
        //     from = tmp;
        // }
        var pair = [from,to].join('_');
        
        if(pair = 'golos_rur') {
            
            return YoBitAdapter.get_pair('btc','rur', function(err, btcrur_price) {
                get_golosbtcprice(function(gprice) {
                    log('BTC/RUR ' + btcrur_price.toString());
                    log('GOLOS/BTC' + gprice.toString());
                    return callback(false, gprice * btcrur_price);
                })
            });

        }
        return callback(true, null);
    },
}

function get_avg(data) {
    // Pull out just the values
    var vals = [];
    for(var k in data) { vals.push(data[k]); }
    return median(vals);
}

// Allows a pair such as USD_BTC to work for BTC_USD
function ReverseAdapter(from, to, p_adapter) {
    return {
        get_pair: function(from,to,callback) {
            p_adapter.get_pair(to,from, function(err,data) {
                if(err) {
                    console.error('reverse error',p_adapter.name, err);
                    return callback(true,null); 
                }
                return callback(false, 1.0 / parseFloat(data))
            })
        }
    }
}

function get_golosbtcprice(callback) {
    //var adapters = [ LivecoinAdapter, LiquiAdapter, BittrexAdapter, KunaAdapter ],
    var adapters = [ BittrexAdapter ],
        promises = [], output = {};

    for(var a in adapters) {
        if(!adapters.hasOwnProperty(a)) {
            continue;
        }

        var prom = new Promise(function(resolve,reject) {
            var adapter = adapters[a],
            exname = adapter.name,
            reverse = true;
            var exname = adapters[a].name
            // for(var c in adapter.provides) {
            //     var x = adapter.provides[c];
            //     if(x[0] == 'golos' && x[1] == 'btc') {
            //         reverse = false;
            //         break;
            //     }
            // }
            // log('Adapter %s reverse %s', adapter.name, reverse);
            // if(reverse) {
                // adapter = ReverseAdapter('btc', 'golos', adapter);
            // }
            // log(exname);
            // log(a);
            // log(adapter);
            adapter.get_pair('GOLOS','BTC',function(err,price) {
                if(err) {
                    // rather than hang up if an exchange is dead
                    // we just log it and move on...
                    console.error('Exchange %s is down! Skipping...',exname, err); 
                    return resolve(); 
                }

                log('%s price %s', exname, price)
                output[exname] = parseFloat(price);
                resolve();
            });
        });
        promises.push(prom);
    }
    

    // Run all of the exchange queries
    // then callback the output
    Promise.all(promises)
    .then(
        function() { log('%j', output); callback(get_avg(output)) }, 
        function(e) { log('An unexpected error has occurred', e)}
    );
}

module.exports = VirtualAdapter;
