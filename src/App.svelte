<script>
	import LiveCoins from "./LiveCoins.svelte";
	import LiveStocks from "./LiveStocks.svelte"
</script>
<body class='body'>
	<main class='main'>
		<!-- <div class='chart-grid twoXone'> -->
		<div class='maindiv'>
			<div class='chart-grid twoXone'>
				<LiveCoins/>
				<LiveStocks/>
			</div>
		</div>
		
		
	</main>
</body>


<style>
.chart-grid.twoXone { 
        display: grid; 
        grid-template-columns: repeat(2, 1fr); 
        grid-template-rows: repeat(1, 1fr); 
        grid-column-gap: 2em;
		padding-left: 4em;
		padding-right: 4em;
        /* grid-row-gap: 10px;  */
		width: 100%;
		height: 100%;
    }
	.chart-grid {
	padding-left: 3em;
	
	}
	/* .main{
		background-color: black;
	} */
	.body{
		background-color: black;
		width: 100vw;
		height: 100vw;;
		overflow: hidden;
		/* margin: -10px -10px -10px -10px;
		padding: -10px -10px -10px -10px; */
	}
	body::-webkit-scrollbar{
		display: none;
	}
	/* body{
		background-color: black;
		margin: 0px;
		padding: 0px;
		width: 100%;
		height: 100%;
	} */
</style>


<!-- <main>
	placeholder
</main> -->


<!-- <style>
	/* main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	} */

	/* h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	} */

	/* @media (min-width: 640px) {
		main {
			max-width: none;
		}
	} */
</style> -->