jQuery.fn.highlight = function (regex, className) {
    return this.each(function () {
        $(this).contents().filter(function() {
            return this.nodeType == 3 && regex.test(this.nodeValue);
        }).replaceWith(function() {
            return (this.nodeValue || "").replace(regex, function(match) {
                return "<span class=\"" + className + "\">" + match + "</span>";
            });
        });
    });
};
