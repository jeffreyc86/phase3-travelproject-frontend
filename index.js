// global variables
const detailsContainer = document.querySelector("#details-container")

const logInForm = document.querySelector('#log-in-form')
const url = 'http://localhost:3000/'
let selectedCity


// fetch requests
const fetchAllCities = () => {
    fetch(`${url}cities`)
    .then(response => response.json())
    .then(renderCitySelection)
}


const fetchCityDetails = (e) => {
    const id = e.target.dataset.id
    fetch(`${url}cities/${id}`)
    .then(response => response.json())
    .then(renderIndividualCity)
}








// manipulate the DOM

const renderCitySelection = citiesArray => {
    detailsContainer.innerHTML = ""
    const citiesHeader = document.createElement('div')
    detailsContainer.append(citiesHeader)
    //All Cities header
    //click on the city you'd like to learn about/visit 
    citiesArray.forEach(cityObj => {
        //indidvidual cards for each city
        //city name is displayed on the on the city image
        //when mouse if hovered, the city image plays video
        //detailscontainer.append(newciycard)

        citiesHeader.innerHTML += `
        <div data-id='${cityObj.id}' id='city-card'>
            <iframe width="560" height="315" src="${cityObj.display_url}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
            </iframe>
            <h6><button type="button" data-id='${cityObj.id}' id='city-name'>${cityObj.name}</button></h6>
            <h6 id='city-continent'>${cityObj.continent}</h6>
            <h6 id='city-country'>${cityObj.country}</h6>
        </div>
        `
    })
}
    


const renderIndividualCity = (cityObj) => {
    detailsContainer.innerHTML = ""

    // div city name, id/class
    const indidvidualCityDetails = document.createElement('div')
    indidvidualCityDetails.classList.add('individual-city-details')
    const cityName = document.createElement('h1')
    const cityDescription = document.createElement('h3')

    cityName.innerText = cityObj.name
    cityDescription.innerText = cityObj.description

    indidvidualCityDetails.append(cityName, cityDescription)
    detailsContainer.append(indidvidualCityDetails)
    
    const foodVids = cityObj.videos.filter(video => video.category === "Food")
    const walkingVids = cityObj.videos.filter(video => video.category === "Walking Tour")
    const leisureVids = cityObj.videos.filter(video => video.category === "Leisure")
    const culturalVids = cityObj.videos.filter(video => video.category === "Cultural")
    const nightlifeVids = cityObj.videos.filter(video => video.category === "Nightlife")

    const videoCategoryArray = [foodVids, walkingVids, leisureVids, culturalVids, nightlifeVids]
    renderCategoryVideos(videoCategoryArray)

    // individual divs per video category
    // iterate through videos with that category to give mini displays
}

const renderCategoryVideos = videoCategoryArray => {

    videoCategoryArray.forEach(categoryArray => {
        const newDiv = document.createElement('div')
        const newH1 = document.createElement('h1')
            newH1.innerText = categoryArray[0].category
        newDiv.append(newH1)
        detailsContainer.append(newDiv)

        categoryArray.forEach(video => {
            const videoDiv = document.createElement('div')
                videoDiv.dataset.id = video.id
                videoDiv.innerHTML = `
                    <iframe width="280" height="158" src="${video.video_url}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
                    </iframe>
                    <button type="button" data-id='${video.id}' id='video-title'>${video.title}</button>
                    <p id='video-likes'>Likes: ${video.likes}</p>`
            
            newDiv.append(videoDiv)
        })

    })
}


const renderUserPage = (userObj) => {
    //either render a user page OR render the cities page - fetchAllCities()
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




detailsContainer.addEventListener('click', e => {
    if (e.target.matches('#city-name')) {
        fetchCityDetails(e)
    } else if (e.target.matches('#video-title')){
        console.log("video info")
    }
})




// Random