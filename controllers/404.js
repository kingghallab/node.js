exports.notFound404 = (req, res, next) =>{
    res.status(404).render("404NotFound.ejs", {pageTitle: "Page Not Found ya ostaz", path: null});
}