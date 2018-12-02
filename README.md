# MovieSearch
Search for movies in IMDB.
Please copy this file ( https://github.com/PVAngular/MovieSearch/blob/master/index.html ) into your browser

Notes on implementation:
**Performance**
An API call is made as soon as a user types in any searchterm in the browser. 
For subsequent requests of the same search term , localstorage is used as a cache.
**Cross browser Support**
Supports browsers(Chrome, Firefox, Edge , Safari)
Added a polyfill js to support window.fetch API call on IE Edge(some versions of IE edge dont have native implementation of window.fetch)

**Mobile support**
Added responsive meta tag in index.html to support scaling of browser width.
For some mobile devices, there may be extra space next to Movie cards(which have poster, title , etc) in each row but no overlap or truncation of data.
Added "touchstart" event to support mobile device tap(to display additional info  on the movie)

**Movie Results Pagination**
I looked at the OMDBAPI documentation and couldnt find how many results were considered too many by the API. I was planning on implementing pagination on UI in case the API took a long time to process certain searchterms.But, I havent found any searchterms for which the API seemed to take a long time - so didnt really address this.
