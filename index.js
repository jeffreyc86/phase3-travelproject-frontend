// global variables
const detailsContainer = document.querySelector("#details-container")
const navBar = document.querySelector('nav')
const logInForm = document.querySelector('#log-in-form')
const url = 'http://localhost:3000/'
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


  const fetchCreateNewUser = e => {
    e.preventDefault()
    fetch(`${url}users`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({name: e.target.name.value}),
      })
      .then(response => response.json())
      .then(userObj => {
        if (userObj.id) {
            loginUser(userObj)
        } else {
            alert(userObj.error)
            e.target.reset()
        }
    });
  }


const increaseLikes = e => {
    const id = e.target.dataset.id
    const likesP = detailsContainer.querySelector('.likes-count')
    let currentLikesPlusOne = parseInt(likesP.innerText.split(' ')[1]) + 1
       
    fetch(`${url}videos/${id}`, {
        method: 'PATCH',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({'likes': currentLikesPlusOne}),
    })
    .then(response => response.json())
    .then(videoObj => {
        likesP.innerText = `Likes: ${videoObj.likes}`
    })
}


const fetchUploadVideo = e => {
    e.preventDefault()

    const arr = e.target.video_url.value.split("https://www.youtube.com/watch?v=")
    const vidUrl = `https://www.youtube.com/embed/${arr[1]}`

    const videoObj = {
        city_id: e.target.city.selectedOptions[0].dataset.id,
        user_id: currentUser.id,
        title: e.target.title.value,
        category: e.target.category.value,
        video_url: vidUrl,
        likes: 0
    }
 
    fetch(`${url}videos`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoObj),
      })
      .then(response => response.json())
      .then(renderVideoForList)

    const uploadButton = detailsContainer.querySelector(`#upload-form-button`)
        uploadButton.innerText = 'Upload a Video'
        uploadButton.dataset.show = false
     
    e.target.reset()
    e.target.style.display = 'none'
}


const fetchToDeleteVideo = e => {
    const id = parseInt(e.target.dataset.id)
    fetch(`${url}videos/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    renderUserPage()
}

// manipulate the DOM
const renderCitySelection = citiesArray => {
    detailsContainer.innerHTML = ""
    const citiesHeader = document.createElement('div')
        citiesHeader.className = "video-container"
    detailsContainer.append(citiesHeader)
    //All Cities header
    //click on the city you'd like to learn about/visit 
    citiesArray.forEach(cityObj => {
        //indidvidual cards for each city
        //city name is displayed on the on the city image
        //when mouse if hovered, the city image plays video
        //detailscontainer.append(newciycard)
        citiesHeader.innerHTML += `
        <div data-id='${cityObj.id}' class='city-card'>
            <img class="static" src="${cityObj.static_url}" alt="${cityObj.name}">
            <img class="active" src="${cityObj.display_url}" alt="${cityObj.name}">
            <h6><button type="button" data-id='${cityObj.id}' class='city-name'>${cityObj.name}</button></h6>
            <h6 class='city-continent'>${cityObj.continent}</h6>
            <h6 class='city-country'>${cityObj.country}</h6>
        </div>
        `
    })
}


const renderIndividualCity = (cityObj) => {
    detailsContainer.innerHTML = ""
    const cityDisplayContainer = document.createElement('div')
        cityDisplayContainer.className = "city-display-container"
    detailsContainer.append(cityDisplayContainer)
    // div city name, id/class
    const indidvidualCityDetails = document.createElement('div')
        indidvidualCityDetails.classList.add('individual-city-details')
    const cityName = document.createElement('h1')
    const cityDescription = document.createElement('p')

    cityName.innerText = cityObj.name
    cityName.style.fontSize = 70
    cityDescription.innerText = cityObj.description

    indidvidualCityDetails.append(cityName, cityDescription)
    cityDisplayContainer.append(indidvidualCityDetails)
    
    const foodVids = cityObj.videos.filter(video => video.category === "Food")
    const leisureVids = cityObj.videos.filter(video => video.category === "Leisure")
    const nightlifeVids = cityObj.videos.filter(video => video.category === "Nightlife")
    const culturalVids = cityObj.videos.filter(video => video.category === "Cultural")
    const walkingVids = cityObj.videos.filter(video => video.category === "Walking Tour")

    const videoCategoryArray = [foodVids, leisureVids, nightlifeVids, culturalVids, walkingVids]
    renderCategoryVideos(videoCategoryArray)
    // individual divs per video category
    // iterate through videos with that category to give mini displays
}


const renderCategoryVideos = videoCategoryArray => {
    videoCategoryArray.forEach(categoryArray => {
        const categoryDiv = document.createElement('div')
            categoryDiv.className = "category-container" 
        const newH1 = document.createElement('h1')
            newH1.innerText = categoryArray[0].category
        const newBreak = document.createElement('br')
        const cityDisplayContainer = detailsContainer.querySelector(".city-display-container")
        cityDisplayContainer.append(newH1, categoryDiv, newBreak)

        categoryArray.forEach(video => {
            const videoDiv = document.createElement('div')
                videoDiv.className = "video-card"
                videoDiv.dataset.id = video.id
                const key = video.video_url.split('https://www.youtube.com/embed/')[1]
                const thumbnailImg = `http://i3.ytimg.com/vi/${key}/maxresdefault.jpg`
                videoDiv.innerHTML = `
                    <img class="preview-image" src="${thumbnailImg}" alt="${video.title}"><br>
                    <button type="button" data-id='${video.id}' class='video-title'>${video.title}</button>
                    <p class='likes-count'>Likes: ${video.likes}</p>`
            categoryDiv.append(videoDiv)
        })
    })
}


const loginUser = (userObj) => {
    currentUser = userObj
    console.log("logged in")
    const navBarRight = navBar.querySelector('.nav.navbar-nav.navbar-right')
        navBarRight.innerHTML = ""
    const logOutLi = document.createElement('li')
        logOutLi.id = 'logout'
        logOutLi.className = "nav-item"
        logOutLi.innerText = 'Logout'
    navBarRight.append(logOutLi)
    renderUserPage()
}


const renderUserPage = () => {
    fetch(`${url}users/${currentUser.id}`)
    .then(response => response.json())
    .then(userObj => {
        currentUser = userObj
    })

    detailsContainer.innerHTML = ""
    const userDiv = document.createElement('div')
        userDiv.className = "user-details"
    detailsContainer.append(userDiv)

    const newH1 = document.createElement('h1')
        newH1.innerText = `Welcome ${currentUser.name}`
    const uploadDiv = document.createElement('div')
        const uploadFormButton = document.createElement('button')
            uploadFormButton.id = 'upload-form-button'
            uploadFormButton.dataset.show = false
            uploadFormButton.innerText = "Upload a Video"
        const uploadVideoForm = document.createElement('form')
            uploadVideoForm.id = 'upload-video-form'
            uploadVideoForm.dataset.user = currentUser.id
            uploadVideoForm.style.display = 'none'
            uploadVideoForm.innerHTML += videoForm
        uploadDiv.append(uploadFormButton, uploadVideoForm) 
    userDiv.append(newH1, uploadDiv)
                    
    const userVideoListDiv = document.createElement('div')
        userVideoListDiv.className = 'user-video-list'
    const userVideoListH3 = document.createElement('h3')
    userVideoListH3.innerText = `${currentUser.name}'s Uploaded Videos`
    userVideoListDiv.append(userVideoListH3)
    
    userDiv.append(userVideoListDiv)
    currentUser.videos.forEach(renderVideoForList);
}

const renderVideoForList = video => {
    const userVideoListDiv = detailsContainer.querySelector('.user-video-list')
    const userVideoDiv = document.createElement('div')
        userVideoDiv.className = "video-card"
        userVideoDiv.dataset.id = video.id
        const key = video.video_url.split('https://www.youtube.com/embed/')[1]
        const thumbnailImg = `http://i3.ytimg.com/vi/${key}/maxresdefault.jpg`
        userVideoDiv.innerHTML = `
                <img class="preview-image" src="${thumbnailImg}" alt="${video.title}">
                <button type="button" data-id='${video.id}' class='video-title'>${video.title}</button>
                <p class='likes-count'>Likes: ${video.likes}</p>`
      
    userVideoListDiv.append(userVideoDiv)
}

const showUploadVideoForm = e => {
    const uploadVideoForm = detailsContainer.querySelector('#upload-video-form')
    if (e.target.dataset.show === 'false') {
        e.target.innerText = 'Nevermind'
        e.target.dataset.show = true
        uploadVideoForm.style.display = 'block'
    } else {
        e.target.innerText = 'Upload a Video'
        e.target.dataset.show = false
        uploadVideoForm.style.display = 'none'
    }
}


const renderIndividualVideo = (videoObj) => {
    detailsContainer.innerHTML = ""

    const videoPageContainer = document.createElement('div')
        videoPageContainer.className = "video-page-container"
    detailsContainer.append(videoPageContainer)

    const videoDisplayDiv = document.createElement('div')
        videoDisplayDiv.className = "youtube-display"
        videoDisplayDiv.innerHTML = `<iframe width="560" height="315" src="${videoObj.video_url}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
        </iframe>`
 
    const videoDetailsDiv = document.createElement('div')
        videoDetailsDiv.className = 'video-info'
        const videoTitle = document.createElement('h2')
            videoTitle.innerText = videoObj.title
        const videoCategory = document.createElement('h4')
            videoCategory.innerText = videoObj.category
        const videoUploader = document.createElement('p')
            videoUploader.innerText = `Uploaded By: ${videoObj.uploader}`
        const videoLikes = document.createElement('p')
            videoLikes.className = 'likes-count'
            videoLikes.innerText = `Likes: ${videoObj.likes}`
        const increaseLikesButton = document.createElement('button')
            increaseLikesButton.innerText = "Like Video"
            increaseLikesButton.id = "like-button"
            increaseLikesButton.dataset.id = videoObj.id
    videoDetailsDiv.append(videoTitle, videoCategory, videoUploader, videoLikes, increaseLikesButton)

    if (videoObj.user_id === currentUser.id) {
        const videoDeleteBtn = document.createElement('button')
            videoDeleteBtn.id = "delete-video-button"
            videoDeleteBtn.dataset.id = videoObj.id
            videoDeleteBtn.innerText = 'Delete Video'
        videoDetailsDiv.append(videoDeleteBtn)
    }

    const newCommentFormDiv = document.createElement('div')
        newCommentFormDiv.className = "comment-form"

    newCommentFormDiv.innerHTML = `
      <form data-video='${videoObj.id}' data-user='${currentUser.id}' class="add-comment">
          <label for="comment">Add New Comment</label>
          <input type="text" name="comment" placeholder="Add a Comment">
          <button type="submit" >Comment</button>
      </form>
    `

    const commentsDiv = document.createElement('div')
        commentsDiv.className = "comments-area"
        const newUl = document.createElement('ul')
        newUl.className = 'comments-list'
        
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

    videoPageContainer.append(videoDisplayDiv, videoDetailsDiv, newCommentFormDiv, commentsDiv)
}


const slapNewCommentOnDom = (comment) => {
    const commentsUL = document.querySelector('.comments-list')
    
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
            loginUser(userObj)
        } else {
            alert(userObj.error)
            if (document.querySelector('#sign-up-button')){
            } else {
            const newButton = document.createElement('button')
                newButton.id = 'sign-up-button'
                newButton.innerText = "Sign Up"
            detailsContainer.append(newButton)
            }
        }
    })
})


detailsContainer.addEventListener('click', e => {
    if (e.target.matches('.city-name')) {
        fetchCityDetails(e)
    } else if (e.target.matches('.video-title')){
        fetchVideoDetails(e)
    } else if (e.target.matches('#update-comment')){
        renderUpdateForm(e)
    } else if (e.target.matches('#delete-comment')) {
        const commentToRemove = e.target.closest('.comment-card')
        fetchDeleteComment(commentToRemove)
        commentToRemove.remove()
    } else if (e.target.matches('#sign-up-button')){
        renderSignupForm()
    } else if (e.target.matches('#like-button')) {
        increaseLikes(e)
    } else if (e.target.matches(`#upload-form-button`)){
        showUploadVideoForm(e)
    } else if (e.target.matches('#delete-video-button')) {
        fetchToDeleteVideo(e)
    }
})


detailsContainer.addEventListener('submit', e => {
    if (e.target.matches('.add-comment')) {
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
    } else if (e.target.matches("#signup-form")) {
        fetchCreateNewUser(e)
    } else if (e.target.matches('#upload-video-form')){
        fetchUploadVideo(e)
    }
})


navBar.addEventListener('click', e => {
    if (e.target.matches('#logout')) {
        location.reload()
    }
})



// Random
const videoForm = `
    <label for="city">Select a City</label>
        <select name="city">
        <option data-id='10' value="Amsterdam">Amsterdam</option>
        <option data-id='22' value="Bangkok">Bangkok</option>
        <option data-id='12' value="Barcelona">Amsterdam</option>
        <option data-id='15' value="Berlin">Berlin</option>
        <option data-id='9' value="Buenos Aires">Buenos Aires</option>
        <option data-id='18' value="Capetown">Capetown</option>
        <option data-id='3' value="Chicago">Chicago</option>
        <option data-id='20' value="Dubai">Dubai</option>
        <option data-id='21' value="Hong Kong">Hong Kong</option>
        <option data-id='17' value="Istanbul">Istanbul</option>
        <option data-id='6' value="Las Vegas">Las Vegas</option>
        <option data-id='11' value="London">London</option>
        <option data-id='4' value="Los Angeles">Los Angeles</option>
        <option data-id='8' value="Mexico City">Mexico City</option>
        <option data-id='14' value="Milan">Milan</option>
        <option data-id='1' value="New York City">New York City</option>
        <option data-id='25' value="Osaka">Osaka</option>
        <option data-id='13' value="Paris">Paris</option>
        <option data-id='23' value="Phuket">Phuket</option>
        <option data-id='16' value="Prague">Prague</option>
        <option data-id='5' value="San Francisco">San Francisco</option>
        <option data-id='26' value="Seoul">Seoul</option>
        <option data-id='27' value="Shanghai">Shanghai</option>
        <option data-id='24' value="Singapore">Singapore</option>
        <option data-id='19' value="Sydney">Sydney</option>
        <option data-id='28' value="Taipei">Taipei</option>
        <option data-id='2' value="Tokyo">Tokyo</option>
        <option data-id='7' value="Toronto">Toronto</option> 
        </select><br>
    <label for="title">Title</label>
        <input type="text" name="title" placeholder="Add a Title"><br>
    <label for="category">Select a Video Category</label>
        <select name="category">
        <option value="Cultural">Cultural</option>
        <option value="Food">Food</option>
        <option value="Leisure">Leisure</option>
        <option value="Nightlife">Nightlife</option>
        <option value="Walking Tour">Walking Tour</option>
        </select><br>
    <label for="video_url">Video Url</label>
        <input type="text" name="video_url" placeholder="Add a Video Url"><br>
    <button type="submit">Upload Video</button>
    `