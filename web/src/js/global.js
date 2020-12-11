

Number.prototype.round = function (places) {
    return +(Math.round(this + "e+" + places) + "e-" + places);
}



jQuery.fn.display = function (b) {
    if (b)
        return this.show();
    else
        return this.hide();
};

jQuery.fn.setClass = function(b,c) {
    if (b)
        return this.addClass(c);
    else
        return this.removeClass(c);
};

