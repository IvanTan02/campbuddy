const searchBar = document.querySelector('#search-input');
searchBar.addEventListener('input', function (event) {
    const query = event.target.value;
    fetch(`/campgrounds/search?query=${query}`)
        .then(res => res.text())
        .then(html => {
            document.querySelector('#searchResults').innerHTML = html;
        })
})