// global variables
const detailsContainer = document.querySelector("#details-container")
const logInForm = document.querySelector('#log-in-form')
const url = 'http://localhost:3000/'
let selectedCity


// fetch requests
const fetchAllCities = () => {
    fetch(`${url}cities`)
    .then(response => response.json())
    .then(citiesArray => {
        detailsContainer.innerHTML = ""
        //All Cities header
        //click on the city you'd like to learn about/visit 
        citiesArray.forEach(renderCitySelection)
    })
}








// manipulate the DOM

const renderCitySelection = () => {
    //indidvidual cards for each city
    //city name is displayed on the on the city image
    //when mouse if hovered, the city image plays video
}





const renderUserPage = (userObj) => {
    //either render a user page OR render the cities page
}



// add Event Listeners
logInForm.addEventListener('submit', e => {
    e.preventDefault()
    const name = e.target.username.value

    

    fetch(`${url}login`, {
    method: 'POST', 
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify({username: name})
    })
    .then(res => res.json())
    .then(userObj => {
        if (userObj.id) {
            renderUserPage(userObj)
        } else {
            alert(userObj.error)
            // renderSignupPage
        }
    })

    e.target.reset()
})




// Random