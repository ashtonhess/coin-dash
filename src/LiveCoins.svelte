<script>
    import LineChart from "./Charts/LineChart.svelte";

    let coins = ['BTC - Bitcoin','ETH - Ethereum','ADA - Cardano','DOGE - Dogecoin','AVAX - Avalanche', 'SOL - Solano','BNB - Binance Coin', 'MATIC - Polygon'];

    let btc_socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');
    let btc_x1 = +Infinity;
    let btc_x2 = -Infinity;
    let btc_y1 = +Infinity;
    let btc_y2 = -Infinity;
    let btc_alldata = [];

    let eth_socket = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@trade');
    let eth_x1 = +Infinity;
    let eth_x2 = -Infinity;
    let eth_y1 = +Infinity;
    let eth_y2 = -Infinity;
    let eth_alldata = [];

    let ada_socket = new WebSocket('wss://stream.binance.com:9443/ws/adausdt@trade');
    let ada_x1 = +Infinity;
    let ada_x2 = -Infinity;
    let ada_y1 = +Infinity;
    let ada_y2 = -Infinity;
    let ada_alldata = [];

    // let doge_socket = new WebSocket('wss://stream.binance.com:9443/ws/dogeusdt@trade');
    // let doge_x1 = +Infinity;
    // let doge_x2 = -Infinity;
    // let doge_y1 = +Infinity;
    // let doge_y2 = -Infinity;
    // let doge_alldata = [];

    let avax_socket = new WebSocket('wss://stream.binance.com:9443/ws/avaxusdt@trade');
    let avax_x1 = +Infinity;
    let avax_x2 = -Infinity;
    let avax_y1 = +Infinity;
    let avax_y2 = -Infinity;
    let avax_alldata = [];

    // let sol_socket = new WebSocket('wss://stream.binance.com:9443/ws/solusdt@trade');
    // let sol_x1 = +Infinity;
    // let sol_x2 = -Infinity;
    // let sol_y1 = +Infinity;
    // let sol_y2 = -Infinity;
    // let sol_alldata = [];

    // let bnb_socket = new WebSocket('wss://stream.binance.com:9443/ws/bnbusdt@trade');
    // let bnb_x1 = +Infinity;
    // let bnb_x2 = -Infinity;
    // let bnb_y1 = +Infinity;
    // let bnb_y2 = -Infinity;
    // let bnb_alldata = [];

    // let matic_socket = new WebSocket('wss://stream.binance.com:9443/ws/maticusdt@trade');
    // let matic_x1 = +Infinity;
    // let matic_x2 = -Infinity;
    // let matic_y1 = +Infinity;
    // let matic_y2 = -Infinity;
    // let matic_alldata = [];





    // let usdt_socket = new WebSocket('wss://stream.binance.com:9443/ws/usdtusd@trade');
    // let usdt_x1 = +Infinity;
    // let usdt_x2 = -Infinity;
    // let usdt_y1 = +Infinity;
    // let usdt_y2 = -Infinity;
    // let usdt_alldata = [];

    // let avax_socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');
    // let sol_socket = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@trade');
    // let bnb_socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');
    // let usdt_socket = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@trade');
    /* PAYLOAD STRUCTURE
    {
        "e": "trade",     // Event type
        "E": 123456789,   // Event time
        "s": "BNBBTC",    // Symbol
        "t": 12345,       // Trade ID
        "p": "0.001",     // Price
        "q": "100",       // Quantity
        "b": 88,          // Buyer order ID
        "a": 50,          // Seller order ID
        "T": 123456785,   // Trade time
        "m": true,        // Is the buyer the market maker?
        "M": true         // Ignore
    }
    */
    // let socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');

    //let subscribemsg = JSON.parse('{"method": "SUBSCRIBE","params": ["btcusdt@trade"],"id": 1}');

    var btc_every_other_toggle = true;
    var btc_every_other_tracker = 0;
    var btc_get_nth_msg_to_get = 100;
    btc_socket.onmessage = function (event) {
        if(btc_every_other_toggle){
            if(btc_every_other_tracker%btc_get_nth_msg_to_get==0){
                var btc_data = JSON.parse(event.data);
                let btc_data_dict = {'x':btc_data['E'], 'y':parseFloat(btc_data['p'])}
                // let dataDict = {'x':data['E'], 'y':parseFloat(data['c'])}
                if (btc_data_dict.x>btc_x2) btc_x2 = btc_data_dict.x;
                if (btc_data_dict.x<btc_x1) btc_x1 = btc_data_dict.x;
                if (btc_data_dict.y>btc_y2) btc_y2 = btc_data_dict.y;
                if (btc_data_dict.y<btc_y1) btc_y1 = btc_data_dict.y;
                // if (btc_x2-btc_x1>60000) btc_x1 = btc_x2-60000
                if (btc_x2-btc_x1>86400000) btc_x1 = btc_x2-86400000
                btc_alldata.push(btc_data_dict);
                btc_alldata=[...btc_alldata.filter(data => data.x > btc_x1)]
                // btc_every_other_tracker=false;
                btc_every_other_tracker+=1;
            }else{
                btc_every_other_tracker+=1;
            }
        }else{
            var btc_data = JSON.parse(event.data);
            let btc_data_dict = {'x':btc_data['E'], 'y':parseFloat(btc_data['p'])}
            // let dataDict = {'x':data['E'], 'y':parseFloat(data['c'])}
            if (btc_data_dict.x>btc_x2) btc_x2 = btc_data_dict.x;
            if (btc_data_dict.x<btc_x1) btc_x1 = btc_data_dict.x;
            if (btc_data_dict.y>btc_y2) btc_y2 = btc_data_dict.y;
            if (btc_data_dict.y<btc_y1) btc_y1 = btc_data_dict.y;
            // if (btc_x2-btc_x1>60000) btc_x1 = btc_x2-60000
            if (btc_x2-btc_x1>86400000) btc_x1 = btc_x2-86400000
            btc_alldata.push(btc_data_dict);
            btc_alldata=[...btc_alldata.filter(data => data.x > btc_x1)]
            // console.log(btc_alldata[btc_alldata.length-1]);
        }
        
    }
    var eth_every_other_toggle = true;
    var eth_every_other_tracker = 0;
    var eth_get_nth_msg_to_get = 10;
    eth_socket.onmessage = function (event) {
        if(eth_every_other_toggle){
            if(eth_every_other_tracker%eth_get_nth_msg_to_get==0){
                var eth_data = JSON.parse(event.data);
                let eth_data_dict = {'x':eth_data['E'], 'y':parseFloat(eth_data['p'])}
                // let dataDict = {'x':data['E'], 'y':parseFloat(data['c'])}
                if (eth_data_dict.x>eth_x2) eth_x2 = eth_data_dict.x;
                if (eth_data_dict.x<eth_x1) eth_x1 = eth_data_dict.x;
                if (eth_data_dict.y>eth_y2) eth_y2 = eth_data_dict.y;
                if (eth_data_dict.y<eth_y1) eth_y1 = eth_data_dict.y;
                // if (eth_x2-eth_x1>60000) eth_x1 = eth_x2-60000
                if (eth_x2-eth_x1>86400000) eth_x1 = eth_x2-86400000
                eth_alldata.push(eth_data_dict);
                eth_alldata=[...eth_alldata.filter(data => data.x > eth_x1)]
                // eth_every_other_tracker=false;
                eth_every_other_tracker+=1;
            }else{
                eth_every_other_tracker+=1;
            }
        }else{
            var eth_data = JSON.parse(event.data);
            let eth_data_dict = {'x':eth_data['E'], 'y':parseFloat(eth_data['p'])}
            // let dataDict = {'x':data['E'], 'y':parseFloat(data['c'])}
            if (eth_data_dict.x>eth_x2) eth_x2 = eth_data_dict.x;
            if (eth_data_dict.x<eth_x1) eth_x1 = eth_data_dict.x;
            if (eth_data_dict.y>eth_y2) eth_y2 = eth_data_dict.y;
            if (eth_data_dict.y<eth_y1) eth_y1 = eth_data_dict.y;
            // if (eth_x2-eth_x1>60000) eth_x1 = eth_x2-60000
            if (eth_x2-eth_x1>86400000) eth_x1 = eth_x2-86400000
            eth_alldata.push(eth_data_dict);
            eth_alldata=[...eth_alldata.filter(data => data.x > eth_x1)]
            // console.log(eth_alldata[eth_alldata.length-1]);
        }
        
    }
    // eth_socket.onmessage = function (event) {
    //     var eth_data = JSON.parse(event.data);
    //     let eth_data_dict = {'x':eth_data['E'], 'y':parseFloat(eth_data['p'])}
    //     // let dataDict = {'x':data['E'], 'y':parseFloat(data['c'])}
    //     if (eth_data_dict.x>eth_x2) eth_x2 = eth_data_dict.x;
    //     if (eth_data_dict.x<eth_x1) eth_x1 = eth_data_dict.x;
    //     if (eth_data_dict.y>eth_y2) eth_y2 = eth_data_dict.y;
    //     if (eth_data_dict.y<eth_y1) eth_y1 = eth_data_dict.y;
    //     // if (eth_x2-eth_x1 > 60000) eth_x1 = eth_x2-60000
    //     if (eth_x2-eth_x1>86400000) eth_x1 = eth_x2-86400000
    //     eth_alldata.push(eth_data_dict);
    //     eth_alldata=[...eth_alldata.filter(data => data.x > eth_x1)]
    //     // console.log(eth_alldata[eth_alldata.length-1]);
    // }
    ada_socket.onmessage = function (event) {
        var ada_data = JSON.parse(event.data);
        let ada_data_dict = {'x':ada_data['E'], 'y':parseFloat(ada_data['p'])}
        // let dataDict = {'x':data['E'], 'y':parseFloat(data['c'])}
        if (ada_data_dict.x>ada_x2) ada_x2 = ada_data_dict.x;
        if (ada_data_dict.x<ada_x1) ada_x1 = ada_data_dict.x;
        if (ada_data_dict.y>ada_y2) ada_y2 = ada_data_dict.y;
        if (ada_data_dict.y<ada_y1) ada_y1 = ada_data_dict.y;
        // if (btc_x2-btc_x1>60000) btc_x1 = btc_x2-60000
        if (ada_x2-ada_x1>86400000) ada_x1 = ada_x2-86400000
        ada_alldata.push(ada_data_dict);
        ada_alldata=[...ada_alldata.filter(data => data.x > btc_x1)]
        // console.log(ada_alldata[ada_alldata.length-1]);
    }
    // doge_socket.onmessage = function (event) {
    //     var doge_data = JSON.parse(event.data);
    //     let doge_data_dict = {'x':doge_data['E'], 'y':parseFloat(doge_data['p'])}
    //     // let dataDict = {'x':data['E'], 'y':parseFloat(data['c'])}
    //     if (doge_data_dict.x>doge_x2) doge_x2 = doge_data_dict.x;
    //     if (doge_data_dict.x<doge_x1) doge_x1 = doge_data_dict.x;
    //     if (doge_data_dict.y>doge_y2) doge_y2 = doge_data_dict.y;
    //     if (doge_data_dict.y<doge_y1) doge_y1 = doge_data_dict.y;
    //     // if (doge_x2-doge_x1>60000) doge_x1 = doge_x2-60000
    //     if (doge_x2-doge_x1>86400000) doge_x1 = doge_x2-86400000
    //     doge_alldata.push(doge_data_dict);
    //     doge_alldata=[...doge_alldata.filter(data => data.x > doge_x1)]
    //     // console.log(doge_alldata[doge_alldata.length-1]);
    // }
    avax_socket.onmessage = function (event) {
        var avax_data = JSON.parse(event.data);
        let avax_data_dict = {'x':avax_data['E'], 'y':parseFloat(avax_data['p'])}
        // let dataDict = {'x':data['E'], 'y':parseFloat(data['c'])}
        if (avax_data_dict.x>avax_x2) avax_x2 = avax_data_dict.x;
        if (avax_data_dict.x<avax_x1) avax_x1 = avax_data_dict.x;
        if (avax_data_dict.y>avax_y2) avax_y2 = avax_data_dict.y;
        if (avax_data_dict.y<avax_y1) avax_y1 = avax_data_dict.y;
        // if (avax_x2-avax_x1>60000) avax_x1 = avax_x2-60000
        if (avax_x2-avax_x1>86400000) avax_x1 = avax_x2-86400000
        avax_alldata.push(avax_data_dict);
        avax_alldata=[...avax_alldata.filter(data => data.x > avax_x1)]
        // console.log(avax_alldata[avax_alldata.length-1]);
    }
    // sol_socket.onmessage = function (event) {
    //     var sol_data = JSON.parse(event.data);
    //     let sol_data_dict = {'x':sol_data['E'], 'y':parseFloat(sol_data['p'])}
    //     // let dataDict = {'x':data['E'], 'y':parseFloat(data['c'])}
    //     if (sol_data_dict.x>sol_x2) sol_x2 = sol_data_dict.x;
    //     if (sol_data_dict.x<sol_x1) sol_x1 = sol_data_dict.x;
    //     if (sol_data_dict.y>sol_y2) sol_y2 = sol_data_dict.y;
    //     if (sol_data_dict.y<sol_y1) sol_y1 = sol_data_dict.y;
    //     // if (sol_x2-sol_x1>60000) sol_x1 = sol_x2-60000
    //     if (sol_x2-sol_x1>86400000) sol_x1 = sol_x2-86400000
    //     sol_alldata.push(sol_data_dict);
    //     sol_alldata=[...sol_alldata.filter(data => data.x > sol_x1)]
    //     // console.log(sol_alldata[sol_alldata.length-1]);
    // }
    // bnb_socket.onmessage = function (event) {
    //     var bnb_data = JSON.parse(event.data);
    //     let bnb_data_dict = {'x':bnb_data['E'], 'y':parseFloat(bnb_data['p'])}
    //     // let dataDict = {'x':data['E'], 'y':parseFloat(data['c'])}
    //     if (bnb_data_dict.x>bnb_x2) bnb_x2 = bnb_data_dict.x;
    //     if (bnb_data_dict.x<bnb_x1) bnb_x1 = bnb_data_dict.x;
    //     if (bnb_data_dict.y>bnb_y2) bnb_y2 = bnb_data_dict.y;
    //     if (bnb_data_dict.y<bnb_y1) bnb_y1 = bnb_data_dict.y;
    //     // if (bnb_x2-bnb_x1>60000) bnb_x1 = bnb_x2-60000
    //     if (bnb_x2-bnb_x1>86400000) bnb_x1 = bnb_x2-86400000
    //     bnb_alldata.push(bnb_data_dict);
    //     bnb_alldata=[...bnb_alldata.filter(data => data.x > bnb_x1)]
    //     // console.log(bnb_alldata[bnb_alldata.length-1]);
    // }
    // matic_socket.onmessage = function (event) {
    //     var matic_data = JSON.parse(event.data);
    //     let matic_data_dict = {'x':matic_data['E'], 'y':parseFloat(matic_data['p'])}
    //     // let dataDict = {'x':data['E'], 'y':parseFloat(data['c'])}
    //     if (matic_data_dict.x>matic_x2) matic_x2 = matic_data_dict.x;
    //     if (matic_data_dict.x<matic_x1) matic_x1 = matic_data_dict.x;
    //     if (matic_data_dict.y>matic_y2) matic_y2 = matic_data_dict.y;
    //     if (matic_data_dict.y<matic_y1) matic_y1 = matic_data_dict.y;
    //     // if (matic_x2-matic_x1>60000) matic_x1 = matic_x2-60000
    //     if (matic_x2-matic_x1>86400000) matic_x1 = matic_x2-86400000
    //     matic_alldata.push(matic_data_dict);
    //     matic_alldata=[...matic_alldata.filter(data => data.x > matic_x1)]
    //     // console.log(matic_alldata[matic_alldata.length-1]);
    // }
    

</script>

<!-- <h1>Live Coins</h1> -->

<div class='chart-grid oneXfour'>
    <LineChart bind:data={btc_alldata} bind:x1={btc_x1} bind:x2={btc_x2} bind:y1={btc_y1} bind:y2={btc_y2} bind:header={coins[0]}/>
    <LineChart bind:data={eth_alldata} bind:x1={eth_x1} bind:x2={eth_x2} bind:y1={eth_y1} bind:y2={eth_y2} bind:header={coins[1]}/>
    <LineChart bind:data={ada_alldata} bind:x1={ada_x1} bind:x2={ada_x2} bind:y1={ada_y1} bind:y2={ada_y2} bind:header={coins[2]}/>
    <!-- <LineChart bind:data={doge_alldata} bind:x1={doge_x1} bind:x2={doge_x2} bind:y1={doge_y1} bind:y2={doge_y2} bind:header={coins[3]}/> -->
    <LineChart bind:data={avax_alldata} bind:x1={avax_x1} bind:x2={avax_x2} bind:y1={avax_y1} bind:y2={avax_y2} bind:header={coins[4]}/>
    <!-- <LineChart bind:data={sol_alldata} bind:x1={sol_x1} bind:x2={sol_x2} bind:y1={sol_y1} bind:y2={sol_y2} bind:header={coins[5]}/> -->
    <!-- <LineChart bind:data={bnb_alldata} bind:x1={bnb_x1} bind:x2={bnb_x2} bind:y1={bnb_y1} bind:y2={bnb_y2} bind:header={coins[6]}/> -->
    <!-- <LineChart bind:data={matic_alldata} bind:x1={matic_x1} bind:x2={matic_x2} bind:y1={matic_y1} bind:y2={matic_y2} bind:header={coins[7]}/> -->
</div>



<style>
    .chart-grid.oneXfour { 
        display: grid; 
        grid-template-columns: repeat(1, 1fr); 
        grid-template-rows: repeat(4, 1fr); 
        grid-column-gap: 5em;
        grid-row-gap: 70px; 
    }
</style>