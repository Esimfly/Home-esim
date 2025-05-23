
async function gat() {
    const response = await fetch("https://api.esim-go.com/v2.4/bundles")
    const data = await response.json()
    console.log(data)
}

gat()