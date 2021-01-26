// global variables
const detailsContainer = document.querySelector("#details-container")

const logInForm = document.querySelector('#log-in-form')
const url = 'http://localhost:3000/'
let selectedCity
let currentUser


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


const fetchVideoDetails = (e) => {
    const id = e.target.dataset.id
    fetch(`${url}videos/${id}`)
    .then(response => response.json())
    .then(renderIndividualVideo)
}


const postNewCommentToBackend = newCommentObj => {
    fetch(`${url}comments`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCommentObj),
      })
      .then(response => response.json())
      .then(slapNewCommentOnDom);
  }


  const fetchDeleteComment = (e) => {
    const id = parseInt(e.dataset.id)
    fetch(`${url}comments/${id}`, {
        method: 'DELETE', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(e),
    })
    .then(response => response.json())
  }



  
  
  const fetchUpdateComment = e => {
    e.preventDefault()
    
    const id = e.target.dataset.id
    
    if (e.target.comment.value === "") {
        e.target.comment.value = e.target.comment.placeholder
    }
    
    const updatedComment = e.target.comment.value

    fetch(`${url}comments/${id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({comment: updatedComment})
    })
    .then(response => response.json())
    .then(updatedCommentObj => {
        const commentLi = detailsContainer.querySelector(`li[data-id="${updatedCommentObj.id}"]`)
        const commentP = commentLi.querySelector('p')
            commentP.innerText = updatedCommentObj.comment
        const updateButton = commentLi.querySelector('#update-comment')
            updateButton.dataset.show = false
            updateButton.innerText = 'Update'
    })

    e.target.reset()
    e.target.remove()
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
                const key = video.video_url.split('https://www.youtube.com/embed/')[1]
                const thumbnailImg = `http://i3.ytimg.com/vi/${key}/maxresdefault.jpg`
                videoDiv.innerHTML = `
                    <img width="280" height="158" src="${thumbnailImg}" alt="${video.title}">
                    <button type="button" data-id='${video.id}' id='video-title'>${video.title}</button>
                    <p id='video-likes'>Likes: ${video.likes}</p>`
            
            newDiv.append(videoDiv)
        })

    })
}


const renderUserPage = (userObj) => {
    currentUser = userObj
    console.log("logged in")
    fetchAllCities()
    //either render a user page OR render the cities page - fetchAllCities()
}





const renderIndividualVideo = (videoObj) => {
    detailsContainer.innerHTML = ""

    const videoDisplayDiv = document.querySelector('div')
        videoDisplayDiv.innerHTML = `<iframe width="560" height="315" src="${videoObj.video_url}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
        </iframe>`

    
    const videoDetailsDiv = document.createElement('div')
        const videoTitle = document.createElement('h2')
            videoTitle.innerText = videoObj.title
        const videoCategory = document.createElement('h4')
            videoCategory.innerText = videoObj.category
        const videoLikes = document.createElement('p')
            videoLikes.innerText = `Likes: ${videoObj.likes}`
    const increaseLikesButton = document.createElement('button')
        increaseLikesButton.innerText = "Like Video"
        increaseLikesButton.id = "like-button"
        increaseLikesButton.dataset.id = videoObj.id
    videoDetailsDiv.append(videoTitle, videoCategory, videoLikes, increaseLikesButton)
    
    const newCommentFormDiv = document.createElement('div')

    newCommentFormDiv.innerHTML = `
      <form data-video='${videoObj.id}' data-user='${currentUser.id}' id="add-comment">
          <label for="comment">Add New Comment</label>
          <input type="text" name="comment" id="comment-area" placeholder="Add a Comment">
          <button type="submit" id="submit-comment">Comment</button>
      </form>
    `

    const commentsDiv = document.createElement('div')
        const newUl = document.createElement('ul')
        newUl.id = 'comments-list'
        
        videoObj.comments.forEach(comment => {

            const newLi = document.createElement('li')
                newLi.dataset.id = comment.id
                newLi.className = "comment-card"
            const newBlockquote = document.createElement("BLOCKQUOTE")
                newBlockquote.className = 'blockquote'
            newLi.append(newBlockquote)
                const newP = document.createElement('p')
                    newP.className = 'mb-0'
                    newP.innerText = comment.comment
                const newFooter = document.createElement('footer')
                    newFooter.className = 'blockquote-footer'
                    newFooter.innerText = comment.author
                const newBr = document.createElement('br')
            newBlockquote.append(newP, newFooter, newBr)

            if (comment.user_id === currentUser.id) {
                const updateBtn = document.createElement('button')
                    updateBtn.id = "update-comment"
                    updateBtn.dataset.show = false
                    updateBtn.dataset.id = comment.id
                    updateBtn.innerText = 'Update'
                const deleteBtn = document.createElement('button')
                    deleteBtn.id = "delete-comment"
                    deleteBtn.dataset.id = comment.id
                    deleteBtn.innerText = 'Delete'
                
                newBlockquote.append(updateBtn, deleteBtn)
            }

            newUl.append(newLi)
        })
    commentsDiv.append(newUl)

    detailsContainer.append(videoDisplayDiv, videoDetailsDiv, newCommentFormDiv, commentsDiv)
}



const slapNewCommentOnDom = (comment) => {
    const commentsUL = document.querySelector('#comments-list')
    
        const newLi = document.createElement('li')
            newLi.dataset.id = comment.id
            newLi.className = "comment-card"
        const newBlockquote = document.createElement("BLOCKQUOTE")
            newBlockquote.className = 'blockquote'
        newLi.append(newBlockquote)
            const newP = document.createElement('p')
                newP.className = 'mb-0'
                newP.innerText = comment.comment
            const newFooter = document.createElement('footer')
                newFooter.className = 'blockquote-footer'
                newFooter.innerText = comment.author
            const newBr = document.createElement('br')
        newBlockquote.append(newP, newFooter, newBr)

        if (comment.user_id === currentUser.id) {
            const updateBtn = document.createElement('button')
                updateBtn.id = "update-comment"
                updateBtn.dataset.show = false
                updateBtn.dataset.id = comment.id
                updateBtn.innerText = 'Update'
            const deleteBtn = document.createElement('button')
                deleteBtn.id = "delete-comment"
                deleteBtn.dataset.id = comment.id
                deleteBtn.innerText = 'Delete'
            
            newBlockquote.append(updateBtn, deleteBtn)
        }

        commentsUL.append(newLi)
}


const renderUpdateForm = (e) => {
    const commentLi = e.target.closest('li')
    if (e.target.dataset.show === "false") {
        e.target.dataset.show = true
        e.target.innerText = 'Nevermind'

        const currentComment = commentLi.querySelector('p').innerText
        const newForm = document.createElement('form')
            newForm.id = 'update-comment-form'
            newForm.dataset.id = e.target.dataset.id
            newForm.innerHTML = `
                    <label for="comment">Update Comment</label>
                    <input type="text" name="comment" id="comment-area" placeholder="${currentComment}">
                    <button type="submit" id="submit-comment">Update</button>`
        
        commentLi.append(newForm)
    } else {
        e.target.dataset.show = false
        e.target.innerText = 'Update'
        
        const updateForm = commentLi.querySelector('form')
        updateForm.remove()      
    }
}



const renderSignupForm = () => {
    detailsContainer.innerHTML = ""

    const newSignupForm = document.createElement('form')
        newSignupForm.id = 'signup-form'
        
        newSignupForm.innerHTML = `
                    <label for="signup">Sign Up</label>
                    <input type="text" name="name" id="name-area" placeholder="Enter New Name">
                    <button type="submit" id="submit-signup">Submit</button>`
        
    detailsContainer.append(newSignupForm)
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
            const newButton = document.createElement('button')
                newButton.id = 'sign-up-button'
                newButton.innerText = "Sign Up"
            detailsContainer.append(newButton)
        }
    })

    e.target.reset()
})




detailsContainer.addEventListener('click', e => {
    if (e.target.matches('#city-name')) {
        fetchCityDetails(e)
    } else if (e.target.matches('#video-title')){
        fetchVideoDetails(e)
    } else if (e.target.matches('#update-comment')){
        renderUpdateForm(e)
    } else if (e.target.matches('#delete-comment')) {
        const commentToRemove = e.target.closest('.comment-card')
        fetchDeleteComment(commentToRemove)
        commentToRemove.remove()
    } else if (e.target.matches('#sign-up-button')){
        renderSignupForm()
    }
})

detailsContainer.addEventListener('submit', e => {
    if (e.target.matches('#add-comment')) {

        e.preventDefault()

        newCommentContent = e.target.comment.value
        newCommentUser = parseInt(e.target.dataset.user)
        newCommentVideo = parseInt(e.target.dataset.video)


        newCommentObj = {
            video_id: newCommentVideo,
            user_id: newCommentUser,
            comment: newCommentContent
        }
        
        postNewCommentToBackend(newCommentObj)
        e.target.reset()
    } else if (e.target.matches('#update-comment-form')) {
        fetchUpdateComment(e)
    } else if (e.target.matches("#submit-signup")) {
        fetchCreateNewUser(e)
    }
})



// Random
