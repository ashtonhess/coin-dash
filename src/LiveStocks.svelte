<script>
    import { onMount, onDestroy} from "svelte";
    import LineChart from "./Charts/LineChart.svelte"



//api stuff from alphavantage. stoppped using because finnhub started to work. 
//still probably useful for historical.
    // 'use strict';
    // var request = require('request');

    // // replace the "demo" apikey below with your own key from https://www.alphavantage.co/support/#api-key
    // var url = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=SPY&interval=1min&apikey=W0A2R1965QGLZGE9';

    // request.get({
    //     url: url,
    //     json: true,
    //     headers: {'User-Agent': 'request'}
    // }, (err, res, data) => {
    //     if (err) {
    //     console.log('Error:', err);
    //     } else if (res.statusCode !== 200) {
    //     console.log('Status:', res.statusCode);
    //     } else {
    //     // data is successfully parsed as a JSON object:
    //     console.log(data);
    //     }
    // });




    let finnhub_socket = new WebSocket('wss://ws.finnhub.io?token=cbtjnl2ad3i65oqci8a0');

    finnhub_socket.onopen = function (){
        finnhub_socket.send('{"type":"subscribe","symbol":"SPY"}');
        finnhub_socket.send('{"type":"subscribe","symbol":"NDAQ"}');

        // finnhub_socket.send('{"type":"subscribe","symbol":"AAPL"}');
        // finnhub_socket.send('{"type":"subscribe","symbol":"ORCL"}');
        // finnhub_socket.send('{"type":"subscribe","symbol":"GOOG"}');
        // finnhub_socket.send('{"type":"subscribe","symbol":"META"}');
        // finnhub_socket.send('{"type":"subscribe","symbol":"AMD"}');
        // finnhub_socket.send('{"type":"subscribe","symbol":"CRSR"}');
        // finnhub_socket.send('{"type":"subscribe","symbol":"AMZN"}');
    }

    let spy_ticker = 'SPY';
    let spy_x1 = +Infinity;
    let spy_x2 = -Infinity;
    let spy_y1 = +Infinity;
    let spy_y2 = -Infinity;
    let spy_alldata = [];

    let ndaq_ticker = 'NDAQ';
    let ndaq_x1 = +Infinity;
    let ndaq_x2 = -Infinity;
    let ndaq_y1 = +Infinity;
    let ndaq_y2 = -Infinity;
    let ndaq_alldata = [];

    finnhub_socket.onmessage = function (event){
        var finnhub_data = JSON.parse(event.data);
        //console.log('DATA: ',finnhub_data);
        
        finnhub_data.data.forEach(element => {
            console.log(element);
            console.log('Ticker: ',element.s, '\nPrice: ', element.p, '\nTime: ', element.t, '\nFormatted Time: ', String(new Date(element.t).toLocaleTimeString()));
            // if(element.s == 'SPY' && element.t>spy_alldata[spy_alldata.length-1].x){
            if(element.s == 'SPY'){
                if(spy_alldata.length>0){
                    if(element.t>spy_alldata[spy_alldata.length-1].x){
                        let spy_data_dict = {'x':element.t, 'y':element.p}
                        if (spy_data_dict.x>spy_x2) spy_x2 = spy_data_dict.x;
                        if (spy_data_dict.x<spy_x1) spy_x1 = spy_data_dict.x;
                        if (spy_data_dict.y>spy_y2) spy_y2 = spy_data_dict.y;
                        if (spy_data_dict.y<spy_y1) spy_y1 = spy_data_dict.y;
                        // if (btc_x2-btc_x1>60000) btc_x1 = btc_x2-60000
                        if (spy_x2-spy_x1>86400000) spy_x1 = spy_x2-86400000
                        spy_alldata.push(spy_data_dict);
                        spy_alldata=[...spy_alldata.filter(data => data.x > spy_x1)]
                    }
                }else{
                    let spy_data_dict = {'x':element.t, 'y':element.p}
                    if (spy_data_dict.x>spy_x2) spy_x2 = spy_data_dict.x;
                    if (spy_data_dict.x<spy_x1) spy_x1 = spy_data_dict.x;
                    if (spy_data_dict.y>spy_y2) spy_y2 = spy_data_dict.y;
                    if (spy_data_dict.y<spy_y1) spy_y1 = spy_data_dict.y;
                    // if (btc_x2-btc_x1>60000) btc_x1 = btc_x2-60000
                    if (spy_x2-spy_x1>86400000) spy_x1 = spy_x2-86400000
                    spy_alldata.push(spy_data_dict);
                    spy_alldata=[...spy_alldata.filter(data => data.x > spy_x1)]
                }
                
                
            }
            if(element.s == 'NDAQ'){
                if(ndaq_alldata.length>0){
                    if(element.t>ndaq_alldata[ndaq_alldata.length-1].x){
                        let ndaq_data_dict = {'x':element.t, 'y':element.p}
                        if (ndaq_data_dict.x>ndaq_x2) ndaq_x2 = ndaq_data_dict.x;
                        if (ndaq_data_dict.x<ndaq_x1) ndaq_x1 = ndaq_data_dict.x;
                        if (ndaq_data_dict.y>ndaq_y2) ndaq_y2 = ndaq_data_dict.y;
                        if (ndaq_data_dict.y<ndaq_y1) ndaq_y1 = ndaq_data_dict.y;
                        // if (btc_x2-btc_x1>60000) btc_x1 = btc_x2-60000
                        if (ndaq_x2-ndaq_x1>86400000) ndaq_x1 = ndaq_x2-86400000
                        ndaq_alldata.push(ndaq_data_dict);
                        ndaq_alldata=[...ndaq_alldata.filter(data => data.x > ndaq_x1)]
                    }
                }else{
                    let ndaq_data_dict = {'x':element.t, 'y':element.p}
                    if (ndaq_data_dict.x>ndaq_x2) ndaq_x2 = ndaq_data_dict.x;
                    if (ndaq_data_dict.x<ndaq_x1) ndaq_x1 = ndaq_data_dict.x;
                    if (ndaq_data_dict.y>ndaq_y2) ndaq_y2 = ndaq_data_dict.y;
                    if (ndaq_data_dict.y<ndaq_y1) ndaq_y1 = ndaq_data_dict.y;
                    // if (btc_x2-btc_x1>60000) btc_x1 = btc_x2-60000
                    if (ndaq_x2-ndaq_x1>86400000) ndaq_x1 = ndaq_x2-86400000
                    ndaq_alldata.push(ndaq_data_dict);
                    ndaq_alldata=[...ndaq_alldata.filter(data => data.x > ndaq_x1)]
                }
                
                
            }
            
        });
    }

    // btc_socket.onmessage = function (event) {
    //     var btc_data = JSON.parse(event.data);
    //     let btc_data_dict = {'x':btc_data['E'], 'y':parseFloat(btc_data['p'])}
    //     // let dataDict = {'x':data['E'], 'y':parseFloat(data['c'])}
    //     if (btc_data_dict.x>btc_x2) btc_x2 = btc_data_dict.x;
    //     if (btc_data_dict.x<btc_x1) btc_x1 = btc_data_dict.x;
    //     if (btc_data_dict.y>btc_y2) btc_y2 = btc_data_dict.y;
    //     if (btc_data_dict.y<btc_y1) btc_y1 = btc_data_dict.y;
    //     // if (btc_x2-btc_x1>60000) btc_x1 = btc_x2-60000
    //     if (btc_x2-btc_x1>86400000) btc_x1 = btc_x2-86400000
    //     btc_alldata.push(btc_data_dict);
    //     btc_alldata=[...btc_alldata.filter(data => data.x > btc_x1)]
    //     // console.log(btc_alldata[btc_alldata.length-1]);
    // }
    
</script>

<!-- <h1>Test2Main</h1> -->
<div class='chart-grid oneX2'>
    <LineChart bind:data={spy_alldata} bind:x1={spy_x1} bind:x2={spy_x2} bind:y1={spy_y1} bind:y2={spy_y2} bind:header={spy_ticker}/>
    <LineChart bind:data={ndaq_alldata} bind:x1={ndaq_x1} bind:x2={ndaq_x2} bind:y1={ndaq_y1} bind:y2={ndaq_y2} bind:header={ndaq_ticker}/>
    
</div>

<style>
.chart-grid.oneX2 { 
        display: grid; 
        grid-template-columns: repeat(1, 1fr); 
        grid-template-rows: repeat(2, 1fr); 
        grid-column-gap: 5em;
        grid-row-gap: 10px; 
        height:100%;
    }
</style>