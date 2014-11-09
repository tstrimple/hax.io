var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('home/index', { title: 'Home' });
});

router.get('/vintage', function(req, res) {
  res.render('home/format', { title: 'Vintage' });
});

router.get('/legacy', function(req, res) {
  res.render('home/format', { title: 'Legacy' });
});

router.get('/modern', function(req, res) {
  res.render('home/format', { title: 'Modern' });
});

router.get('/standard', function(req, res) {
  res.render('home/format', { title: 'Standard' });
});

router.get('/block', function(req, res) {
  res.render('home/format', { title: 'Block' });
});

router.get('/commander', function(req, res) {
  res.render('home/format', { title: 'Commander' });
});

module.exports = router;
