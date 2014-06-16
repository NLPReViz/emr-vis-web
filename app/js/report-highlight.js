jQuery.fn.highlight = function (regex, className, scrollTo) {
    return this.each(function () {
        $(this).contents().filter(function() {
            return this.nodeType == 3 && regex.test(this.nodeValue);
        }).replaceWith(function() {
            return (this.nodeValue || "").replace(regex, function(match) {
            	if(scrollTo)
                	return "<span scroll-bookmark=\"" + scrollTo + "\" class=\"" + className + "\">" + match + "</span>";
                else
                	return "<span class=\"" + className + "\">" + match + "</span>";
            });
        });
    });
};
