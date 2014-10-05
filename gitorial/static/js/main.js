// Generated by CoffeeScript 1.8.0
(function() {
  var __slice = [].slice;

  window.gitorial = {};

  gitorial.session = {
    update: function() {
      $.ajax({
        dataType: 'json',
        type: 'GET',
        url: '/api/session/',
        headers: {
          'x-csrftoken': $.cookie('csrftoken')
        }
      }).done(function(data) {
        gitorial.session.username = data.username;
        gitorial.session.loggedin = data.username !== "";
        gitorial.router();
      }).fail(gitorial.routes.fail);
    },
    username: null,
    loggedin: false
  };

  gitorial.templates = {
    profile: Handlebars.compile($("#profile-template").html()),
    edit: Handlebars.compile($("#edit-template").html()),
    view: Handlebars.compile($("#view-template").html()),
    home: Handlebars.compile($("#home-template").html()),
    fail: Handlebars.compile($("#not-found-template").html())
  };

  gitorial.routes = {
    home: function() {
      var data;
      data = {
        gitorial: gitorial
      };
      $('#container').html(gitorial.templates.home(data));
    },
    tutorialPane: true,
    profile: function(params) {
      var address;
      address = '/api/' + params[0] + '/';
      $.ajax({
        dataType: 'json',
        url: address,
        type: 'GET',
        headers: {
          'x-csrftoken': $.cookie('csrftoken')
        }
      }).done(function(data) {
        data.isowner = gitorial.session.username === params[0];
        data.tutorialPane = gitorial.routes.tutorialPane;
        data.reposPane = !data.tutorialPane;
        data.gitorial = gitorial;
        $('#container').html(gitorial.templates.profile(data));
        $('.new-tutorial-button').on('click', function(e) {
          gitorial.routes.tutorialPane = !gitorial.routes.tutorialPane;
          gitorial.session.update();
        });
        $('.user-listing-title').on('click', function(e) {
          e.preventDefault();
          gitorial.tutorials.handleClick(e);
        });
        return $('#');
      }).fail(function() {
        return $.ajax({
          dataType: 'json',
          url: address,
          type: 'POST',
          headers: {
            'x-csrftoken': $.cookie('csrftoken')
          }
        }).done(function(data) {
          gitorial.session.update();
        }).fail(gitorial.routes.fail);
      });
    },
    edit: function(params) {
      var address;
      address = '/api/' + params[0] + '/' + params[1] + '/';
      $.ajax({
        dataType: 'json',
        url: address,
        headers: {
          'x-csrftoken': $.cookie('csrftoken')
        },
        type: 'GET'
      }).done(function(data) {
        data.isowner = gitorial.session.username === params[0];
        data.gitorial = gitorial;
        $('#container').html(gitorial.templates.edit(data));
        gitorial.tutorials.data = data;
        $('textarea').autosize();
        $('.tutorial-generate-button').on('click', function(e) {
          var heads, tail, _i, _ref;
          e.preventDefault();
          _ref = window.location.hash.split('/'), heads = 2 <= _ref.length ? __slice.call(_ref, 0, _i = _ref.length - 1) : (_i = 0, []), tail = _ref[_i++];
          return window.location.hash = heads.join('/');
        });
      }).fail(gitorial.routes.fail);
    },
    view: function(params) {
      var address;
      address = '/api/' + params[0] + '/' + params[1] + '/';
      $.ajax({
        dataType: 'json',
        url: address,
        headers: {
          'x-csrftoken': $.cookie('csrftoken')
        },
        type: 'GET'
      }).done(function(data) {
        data.isowner = gitorial.session.username === params[0];
        data.gitorial = gitorial;
        data.steps.map(function(value) {
          value.content_before = marked(value.content_before);
          value.content_after = marked(value.content_after);
          return value;
        });
        $('#container').html(gitorial.templates.view(data));
        $('.tutorial-edit-button').on('click', function(e) {
          e.preventDefault();
          return window.location.hash += window.location.hash[window.location.hash.length - 1] === '/' ? 'edit' : '/edit';
        });
      }).fail(gitorial.routes.fail);
    },
    fail: function() {
      $('#container').html(gitorial.templates.fail());
    }
  };

  gitorial.router = function() {
    var editflag, route, tutname, username, _ref;
    route = location.hash.slice(1);
    _ref = route.replace(/\/$/, '').split('/').slice(1), username = _ref[0], tutname = _ref[1], editflag = _ref[2];
    if ((editflag != null) && editflag === "edit") {
      gitorial.routes.edit([username, tutname]);
    } else if (tutname != null) {
      gitorial.routes.view([username, tutname]);
    } else if (username != null) {
      gitorial.routes.profile([username]);
    } else {
      gitorial.routes.home();
    }
  };

  gitorial.tutorials = {};

  gitorial.tutorials = {
    handleClick: function(e) {
      var reponame, user;
      e.preventDefault();
      if (!gitorial.routes.tutorialPane) {
        reponame = e.target.innerHTML;
        user = gitorial.session.username;
        $.ajax({
          dataType: 'json',
          url: '/api/' + user + '/' + reponame + '/',
          type: 'POST',
          headers: {
            'x-csrftoken': $.cookie('csrftoken')
          }
        }).done(function(data) {
          var url;
          url = '/#/' + user + '/' + data.tutorial_id + '/edit';
          location.href = url;
          gitorial.session.update();
        }).fail(gitorial.routes.fail);
      } else {
        reponame = e.target.innerHTML;
        user = gitorial.session.username;
        $.ajax({
          dataType: 'json',
          url: '/api/' + user + '/' + reponame + '/',
          type: 'POST',
          headers: {
            'x-csrftoken': $.cookie('csrftoken')
          }
        }).done(function(data) {
          var url;
          url = '/#/' + user + '/' + data.tutorial_id + '/';
          location.href = url;
          gitorial.session.update();
        }).fail(gitorial.routes.fail);
      }
    },
    data: null,
    save: function() {
      $.ajax({
        dataType: 'json',
        url: '/api/' + gitorial.session.username + '/' + gitorial.session.tutorial_id + '/',
        type: 'POST',
        data: gitorial.tutorials.data
      }).done(function(data) {
        console.log("Saved.");
      }).fail(function() {
        console.log("Unable to save.");
      });
    }
  };

  gitorial.session.update();

  $(window).on('hashchange', gitorial.session.update);

  $(window).on('ready', gitorial.session.update);

}).call(this);
