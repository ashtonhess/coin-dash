<script>
    import LineChart from "./Charts/LineChart.svelte";

    let btc_x1 = +Infinity;
    let btc_x2 = -Infinity;
    let btc_y1 = +Infinity;
    let btc_y2 = -Infinity;
    
    let eth_x1 = +Infinity;
    let eth_x2 = -Infinity;
    let eth_y1 = +Infinity;
    let eth_y2 = -Infinity;

    let btc_alldata = [];
    let eth_alldata = [];

    let btc_socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');
    let eth_socket = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@trade')
    // let socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');

    //let subscribemsg = JSON.parse('{"method": "SUBSCRIBE","params": ["btcusdt@trade"],"id": 1}');

    btc_socket.onmessage = function (event) {

        var btc_data = JSON.parse(event.data);
        let btc_data_dict = {'x':btc_data['E'], 'y':parseFloat(btc_data['p'])}
        // let dataDict = {'x':data['E'], 'y':parseFloat(data['c'])}
        if (btc_data_dict.x>btc_x2) btc_x2 = btc_data_dict.x;
        if (btc_data_dict.x<btc_x1) btc_x1 = btc_data_dict.x;
        if (btc_data_dict.y>btc_y2) btc_y2 = btc_data_dict.y;
        if (btc_data_dict.y<btc_y1) btc_y1 = btc_data_dict.y;
        if (btc_x2-btc_x1>60000) btc_x1 = btc_x2-60000
        
        btc_alldata.push(btc_data_dict);
        btc_alldata=[...btc_alldata.filter(data => data.x > btc_x1)]
        console.log(btc_alldata[btc_alldata.length-1]);
    }
    eth_socket.onmessage = function (event) {

        var eth_data = JSON.parse(event.data);
        let eth_data_dict = {'x':eth_data['E'], 'y':parseFloat(eth_data['p'])}
        // let dataDict = {'x':data['E'], 'y':parseFloat(data['c'])}
        if (eth_data_dict.x>eth_x2) eth_x2 = eth_data_dict.x;
        if (eth_data_dict.x<eth_x1) eth_x1 = eth_data_dict.x;
        if (eth_data_dict.y>eth_y2) eth_y2 = eth_data_dict.y;
        if (eth_data_dict.y<eth_y1) eth_y1 = eth_data_dict.y;
        if (eth_x2-eth_x1 > 60000) eth_x1 = eth_x2-60000
        
        eth_alldata.push(eth_data_dict);
        eth_alldata=[...eth_alldata.filter(data => data.x > eth_x1)]
        console.log(eth_alldata[eth_alldata.length-1]);
    }



</script>

<h1>Live Coins</h1>

<LineChart bind:data={btc_alldata} bind:x1={btc_x1} bind:x2={btc_x2} bind:y1={btc_y1} bind:y2={btc_y2}/>
<LineChart bind:data={eth_alldata} bind:x1={eth_x1} bind:x2={eth_x2} bind:y1={eth_y1} bind:y2={eth_y2}/>



<style>

</style>