// Focus div based on nav button click
const home = document.getElementById("homenav")
home.addEventListener("click", homeclick)
function homeclick() {
    document.getElementById("home").className = "active";
    document.getElementById("single").className = "hidden";
    document.getElementById("multi").className = "hidden";
    document.getElementById("guess").className = "hidden";
}
const si = document.getElementById("singlenav")
si.addEventListener("click", sclick)
function sclick() {
    document.getElementById("home").className = "hidden";
    document.getElementById("single").className = "active";
    document.getElementById("multi").className = "hidden";
    document.getElementById("guess").className = "hidden";
}
const mu = document.getElementById("multinav")
mu.addEventListener("click", muclick)
function muclick() {
    document.getElementById("home").className = "hidden";
    document.getElementById("single").className = "hidden";
    document.getElementById("multi").className = "active";
    document.getElementById("guess").className = "hidden";
}
const gu= document.getElementById("guessnav")
gu.addEventListener("click", guclick)
function guclick() {
    document.getElementById("home").className = "hidden";
    document.getElementById("single").className = "hidden";
    document.getElementById("multi").className = "hidden";
    document.getElementById("guess").className = "active";
}
// Flip one coin and show coin image to match result when button clicked
// Event listener for whatever is being clicked 
//			document.addEventListener("click", activeNow);
// Replace text in anything with "active" id
			// function activeNow() {
			// 	const active_now = document.activeElement
			// 	document.getElementById("active").innerHTML = active_now;
			// 	console.log(active_now)
			// }
// Button coin flip element
const coin = document.getElementById("coin")
// Add event listener for coin button
			coin.addEventListener("click", flipCoin)
			function flipCoin() {
                fetch('app/flip/', {mode: 'cors'})
  				.then(function(response) {
    			  return response.json();
  				})
				.then(function(result) {
					console.log(result);
					document.getElementById("result").innerHTML = result.flip;
                    if (result.flip == "tails") {
                        document.getElementById("quarter").setAttribute("src", "./assets/img/tails.png");
                    }
                    else {
					    document.getElementById("quarter").setAttribute("src", "./assets/img/heads.png");
                    }
					//coin.disabled = true
				})
			}
// Flip multiple coins and show coin images in table as well as summary results
// Enter number and press button to activate coin flip series
		// Our flip many coins form
const coins = document.getElementById("coins")
        // Add event listener for coins form
coins.addEventListener("submit", flipCoins)
        // Create the submit handler
async function flipCoins(event) {
    event.preventDefault();
            
    const endpoint = "app/flip/coins/"
    const url = document.baseURI+endpoint

    const formEvent = event.currentTarget

    try {
        const formData = new FormData(formEvent);
        const flips = await sendFlips({ url, formData });

        console.log(flips);
        document.getElementById("heads").innerHTML = "Heads: "+flips.heads;
        document.getElementById("tails").innerHTML = "Tails: "+flips.tails;
    } catch (error) {
        console.log(error);
    }
}
        // Create a data sender
async function sendFlips({ url, formData }) {
    const plainFormData = Object.fromEntries(formData.entries());
    const formDataJson = JSON.stringify(plainFormData);
    console.log(formDataJson);

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: formDataJson
    };

    const response = await fetch(url, options);
    return response.json()
}
// Guess a flip by clicking either heads or tails button
