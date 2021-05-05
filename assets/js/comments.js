function getXmlHttp(){
	try {
		return new ActiveXObject("Msxml2.XMLHTTP");
	} catch (e) {
		try {
			return new ActiveXObject("Microsoft.XMLHTTP");
		} catch (ee) {
		}
	}
	if (typeof XMLHttpRequest!='undefined') {
		return new XMLHttpRequest();
	}
}

function getUrl(url, cb) { 
	var xmlhttp = getXmlHttp();
	xmlhttp.open("GET", url+'?r='+Math.random());
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4) {
		    var headers = xmlhttp.getAllResponseHeaders();
		    var arr = headers.trim().split(/[\r\n]+/);
		    var headerMap = {};
		    arr.forEach(function (line) {
		      var parts = line.split(': ');
		      var header = parts.shift();
		      var value = parts.join(': ');
		      headerMap[header] = value;
		    });

			cb(xmlhttp.responseText, headers);
		}
	}
	xmlhttp.send(null);
}

function ParseLinkHeader(link) {
    var entries = link.split(",");
    var links = { };
    for (var i in entries) {
        var entry = entries[i];
        var link = { };
        link.name = entry.match(/rel=\"([^\"]*)/)[1];
        link.url = entry.match(/<([^>]*)/)[1];
        link.page = entry.match(/page=(\d+).*$/)[1];
        links[link.name] = link;
    }
    return links;
}

function append(selector, htmldata) {
	selector.insertAdjacentHTML('beforeend', htmldata);
}

function DoGithubComments(comment_id, page_id) {
    var repo_name = "ad/blog.apatin.ru";

    if (page_id === undefined) {
        page_id = 1;
    }

    var url = "https://github.com/" + repo_name + "/issues/" + comment_id;
    var api_url = "https://api.github.com/repos/" + repo_name;
    var api_issue_url = api_url + "/issues/" + comment_id;
    var api_comments_url = api_url + "/issues/" + comment_id + "/comments" + "?page=" + page_id;

	getUrl(api_comments_url, function (contents, headers) {
		var arr = JSON.parse(contents);

		if (arr.message !== undefined) {
			append(document.querySelector("#gh-comments"), "Comments are not open for this post yet.");
			return;
		}

        if (page_id == 1)
        	append(document.querySelector("#gh-comments"), "<a href='" + url + "#new_comment_field' rel='nofollow' class='btn'>Добавить комментарий через Github</a>");
        
        var data="";
        arr.forEach(function (comment, i, arr) {
				var date = new Date(comment.created_at);

            var t = "<div class='gh-comment'>";
            t += "<img src='" + comment.user.avatar_url + "' width='24px'>";
            t += "<b><a href='" + comment.user.html_url + "'>" + comment.user.login + "</a></b>";
            t += " posted at ";
            t += "<em>" + date.toLocaleString() + "</em>";
            t += "<div class='gh-comment-hr'></div>";
            if (comment.body_html) {
            	t += comment.body_html;
        	} else {
        		t += comment.body;
        	}
            t += "</div>";
            append(document.querySelector("#gh-comments-list"), t);
        });


        // if (headers["Link"]) {
	    //     var links = ParseLinkHeader(headers["Link"]);
	    //     if ("next" in links) {
	    //         // $("#gh-load-comments").attr("onclick", "DoGithubComments(" + comment_id + "," + (page_id + 1) + ");");
	    //         // $("#gh-load-comments").show();
	    //     } else {
	    //         // $("#gh-load-comments").hide();
	    //     }
	    // }
	});
}

DoGithubComments(commentID);