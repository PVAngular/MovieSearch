//handle image onerror case  when url is invalid;
function handleImageError(event) {
   var imgElement = event.srcElement;
   imgElement.src = 'images/no_preview.jpg';
   imgElement.onerror = "";
   return true;
}
//given a search term - retrieve the list of movies
function search(evt) {
    evt = (evt) ? evt : (window.event) ? event : null;
    if (evt)
    {
        //for browser compatibility
        var charCode = (evt.charCode) ? evt.charCode :((evt.keyCode) ? evt.keyCode :((evt.which) ? evt.which : 0));
        console.log("typed ",  evt.currentTarget.value + "value", String.fromCharCode(evt.keyCode), (evt.currentTarget.value + String.fromCharCode(evt.keyCode)));
        var searchTerm = "";
        //this means it is a backspace - so truncate the last character
        if(event.keyCode === 8 ){
            searchTerm = evt.currentTarget.value.substring(0, evt.currentTarget.value.length-1 );
        } else {
            searchTerm =  evt.currentTarget.value + String.fromCharCode(evt.keyCode);
        }
        console.log("searchTerm ", searchTerm);
        getMovieShowFromSearchTerm(searchTerm);
    }
}

function getMovieShowFromSearchTerm(searchTerm) {
    //erase movie cards from previous search
    var movieCards = document.querySelector("#movie-container");
    movieCards.innerHTML = "";

    //Since search results are not user dependant, we can use localstorage as our CACHE
    var movieJsonData = window.localStorage.getItem(searchTerm);
    if (movieJsonData) {
        createMovieCards(JSON.parse(movieJsonData));
    }
    else {
        window.fetch("https://www.omdbapi.com/?apikey=aba065d3&s=" + searchTerm, {
            method: 'get'
        }).then(function (response) {
            return response.json();
        }).then(function (jsonData) {
            window.localStorage.setItem(searchTerm, JSON.stringify(jsonData));
            createMovieCards(jsonData);
        }).catch(function (err) {
            console.log("error retrieving movie results for a search term ", err);
        });
    }
}

//Create the movie cards that include a poster preview
function createMovieCards(movieJsonData) {
    //for better performance - attach all DOM nodes to a single fragment and then attach the fragment to the real DOM Node
    var movieCards = document.querySelector("#movie-container");
    var documentFragment = document.createDocumentFragment();
    if (movieJsonData.Response === "True" && movieJsonData.Search) {
        var movieList = movieJsonData.Search;
        var movieCardNode, posterNode, titleNode, typeNode, textNode;
        for (var counter = 0; counter < movieList.length; counter++) {
            var movieItem = movieJsonData.Search[counter];

            //container node that holds the movie item
            var containerNode = document.createElement("div");
            containerNode.classList.add("movie-card-container");
            //for easy retrieval to get movie details about a selected movie.
            containerNode.id = "movie-card-" + movieItem.imdbID;

            //movie poster
            posterNode = document.createElement("img");
            posterNode.setAttribute("src", movieItem.Poster);
            posterNode.style.height = "400px";
            posterNode.style.width = "300px";
            //Some Posters have "N/A" as the URL
            posterNode.onerror = handleImageError;

            //movie title
            titleNode = document.createElement("p");
            textNode = document.createTextNode(movieItem.Title);
            //click and hover behavior
            titleNode.onmouseover = getMovieDetails.bind(window, movieItem.imdbID);
            titleNode.touchstart = getMovieDetails.bind(window, movieItem.imdbID);
            titleNode.appendChild(textNode);

            //movie type
            typeNode = document.createElement("p");
            textNode = document.createTextNode(movieItem.Type);
            typeNode.appendChild(textNode);

            containerNode.appendChild(posterNode);
            containerNode.appendChild(titleNode);
            containerNode.appendChild(typeNode);
            documentFragment.appendChild(containerNode);
            movieCards.append(documentFragment);

        }
    } else {
        //handle error cases
        movieCards.innerHTML = "";
        var containerNode = document.createElement("div");
        if (movieJsonData.Error === "Too many results.") {
            containerNode.innerHTML = "There are too many search results. Please change your search. ";
        } else { //any other error
            containerNode.innerHTML = "There are no search results. Please try again";
        }
        movieCards.append(containerNode);
    }

}

function getMovieDetails(imdbId) {
    var movieDetailJsonData = window.localStorage.getItem(imdbId);
    if (movieDetailJsonData) {
        createMovieCardPopOver(JSON.parse(movieDetailJsonData), imdbId);
    }
    window.fetch("https://www.omdbapi.com/?apikey=aba065d3&i=" + imdbId, {
        method: 'get'
    }).then(function (response) {
        return response.json()
    }).then(function (jsonData) {
        window.localStorage.setItem(imdbId ,JSON.stringify(jsonData));
        createMovieCardPopOver(jsonData, imdbId);
    }).catch(function (error) {
        console.log("error retrieving movie details for a selected movie", error);
    });
}

//Creates HTML Nodes that make up the popover next to a movie card.
function createMovieCardPopOver(movieDetailJsonData, imdbId) {
    var containerNode = document.querySelector(".container-popover");
    var documentFragment = document.createDocumentFragment();
    //null when the first time a movie card is hovered or tapped.
    if (containerNode === null) {
        containerNode = document.createElement("div");
        containerNode.classList.add("container-popover");
    } else {
        containerNode.innerHTML = "";
        containerNode.parentElement.removeChild(containerNode);
    }

    for (var key in movieDetailJsonData) {
        if (key === "Title" || key === "Director" || key === "Year") {
            var pNode = document.createElement("p");
            var textNode = document.createTextNode(movieDetailJsonData[key]);
            pNode.appendChild(textNode);
            containerNode.appendChild(pNode);
        }
        if (key === "Ratings") {
            for (var counter = 0; counter < movieDetailJsonData[key].length; counter++) {
                var pNode = document.createElement("p");
                textNode = document.createTextNode(movieDetailJsonData.Ratings[counter].Source);
                pNode.appendChild(textNode);
                containerNode.appendChild(pNode);

                pNode = document.createElement("p");
                textNode = document.createTextNode(movieDetailJsonData.Ratings[counter].Value);
                pNode.appendChild(textNode);
                containerNode.appendChild(pNode);
            }
        }
        documentFragment.appendChild(containerNode);
        document.querySelector("#movie-card-" + imdbId).appendChild(documentFragment);
    }

}
