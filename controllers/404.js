exports.notFound404 = (req, res, next) =>{
    res.status(404).render("404NotFound.ejs", {pageTitle: "Page Not Found!", path: null});
}

exports.get500 = (req, res, next) => {
    res.status(500).render("500.ejs", {pageTitle: "Error!", path: null});
}