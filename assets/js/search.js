let pagesIndex, searchIndex;

async function initSearch() {
  try {
    const response = await fetch("/index.json");
    pagesIndex = await response.json();
    searchIndex = lunr(function () {
      this.field("title");
      this.field("tags");
      this.field("tagsHTML");
      this.field("content");
      this.ref("href");
      pagesIndex.forEach((page) => this.add(page));
    });

    if (document.getElementById("e2-search") != null) {
      const searchInput = document.getElementById("search");
      searchInput.addEventListener("keyup", (event) => {
        handleSearchQuery(event);
      });
    }
  } catch (e) {
    console.log(e);
  }
}

function handleSearchQuery(event) {
  // event.preventDefault();
  const query = document.getElementById("search").value.trim().toLowerCase();
  if (!query) {
    hideSearchResults();
    return;
  }
  const results = searchSite(query);
  if (!results.length) {
    hideSearchResults();
    return;
  }
  renderSearchResults(query, results);
}

function searchSite(query) {
  const originalQuery = query;
  query = getLunrSearchQuery(query);
  let results = getSearchResults(query);
  return results.length
    ? results
    : query !== originalQuery
    ? getSearchResults(originalQuery)
    : [];
}

function getSearchResults(query) {
  return searchIndex.search(query).flatMap((hit) => {
    if (hit.ref == "undefined") return [];
    let pageMatch = pagesIndex.filter((page) => page.href === hit.ref)[0];
    pageMatch.score = hit.score;
    return [pageMatch];
  });
}

function getLunrSearchQuery(query) {
  const searchTerms = query.split(" ");
  if (searchTerms.length === 1) {
    return query;
  }
  query = "";
  for (const term of searchTerms) {
    query += `+${term} `;
  }
  return query.trim();
}

function renderSearchResults(query, results) {
  clearSearchResults();
  updateSearchResults(query, results);
  showSearchResults();
}

function clearSearchResults() {
  const results = document.querySelector(".search-results div.content");
  while (results.firstChild) results.removeChild(results.firstChild);
}

function updateSearchResults(query, results) {
  document.querySelector(".search-results div.content").innerHTML = results
    .map(
      (hit) => `
    <div id="e2-note-6" class="e2-note" data-score="${hit.score.toFixed(2)}">
        <article>
            <a href="${hit.href}" class="">
                <h1 class="e2-published e2-smart-title" style="font-size: 24px">
                    ${hit.title}
                </h1>
            </a>
            <div class="e2-note-tags">
                <span class="e2-timestamp">${hit.date}</span> &nbsp;
                ${hit.tagsHTML}
            </div>
        </article>
    </div>
    `
    )
    .join("");
  const searchResultListItems = document.querySelectorAll(".search-results div.content article");
}

function showSearchResults() {
  document.querySelector(".search-results").style.display="block";
  document.getElementById("content").style.display="none";
}

function hideSearchResults() {
  document.querySelector(".search-results").style.display="none";
  document.getElementById("content").style.display="block";
}

initSearch();