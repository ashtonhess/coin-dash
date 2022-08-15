<script>
	import LiveCoins from "./LiveCoins.svelte";
</script>

<main>
	<!-- <div class='chart-grid twoXone'> -->
	<div class='chart-grid twoXone'>
		<LiveCoins/>
		<LiveCoins/>
	</div>
	
</main>

<style>
.chart-grid.twoXone { 
        display: grid; 
        grid-template-columns: repeat(2, 1fr); 
        grid-template-rows: repeat(1, 1fr); 
        grid-column-gap: 5em;
		padding-left: 4em;
        /* grid-row-gap: 10px;  */
		width: 100%;
		height: 100%;
    }
	.chart-grid {
	padding-left: 3em;
	
	}

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