(function () {
  'use strict';

  var app = angular.module('playerstats', ['ui.router', 'ui.bootstrap', 'chieffancypants.loadingBar', 'ngAnimate', 'ngSanitize']);

  /* Sidebar*/
  app.controller('SidebarController', function($scope) {

    $scope.arrow = '<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>';
    $scope.state = false;

    $scope.toggleState = function() {
      $scope.state = !$scope.state;

      if (!$scope.state)
        $scope.arrow = '<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>';
      else
        $scope.arrow = '<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>';
    };
  });

  app.directive('sidebarDirective', function() {
    return {
      link : function(scope, element, attr) {
        scope.$watch(attr.sidebarDirective, function(newVal) {
          if(newVal) {
            element.addClass('show');
            return;
          }
          element.removeClass('show');
        });
      }
    };
  });

  app.controller('rankController', function($scope, $http, $state, $stateParams) {

    $scope.from = $stateParams.from == null ? 0 : $stateParams.from;
    $scope.name = $stateParams.name == null ? '' : $stateParams.name;
    $scope.guild = $stateParams.guild == null ? '' : $stateParams.guild;

    $scope.search = $scope.name;

    /* Retrieve all achievement_progress data */
    $http.get( app.api + "character_achievement?from=" + $scope.from + "&name=" + $scope.name + "&guild=" + $scope.guild )
      .success(function (data, status, header, config) {
      $scope.ranks = data;

      for (var i = 0; i < $scope.ranks.length; i++)
      {
        if ($scope.ranks[i] != null) {
          // get faction
          if ($scope.ranks[i].race == 1 || $scope.ranks[i].race == 3 || $scope.ranks[i].race == 4 || $scope.ranks[i].race == 7 || $scope.ranks[i].race == 11)
            $scope.ranks[i].faction = "alliance";
          else
            $scope.ranks[i].faction = "horde";
        }
      }

    })
      .error(function (data, status, header, config) {
      console.log("[ERROR] $http.get request failed in rankController!");
    });

    // OnClick (tr) go to player details
    $scope.showPlayerStats = function(id) {
      $state.go('player', {id: id});
    };

    /* Manage Guild Tab */
    $scope.loadedGuildTab = false;

    $scope.guildTab = function() {

      if (!$scope.loadedGuildTab) {
        $scope.loadedGuildTab = true;
        $scope.fromGuild = 0;

        $scope.getGuildData(0);
      }

    };


    $scope.getGuildData = function(start, searchGuild) {
      $scope.fromGuild = start;

      if (searchGuild == null)
        searchGuild = "";

      $http.get( app.api + "guild_points?from=" + start + "&name=" + searchGuild)
      .success(function (data, status, header, config) {
        $scope.guilds = data;

        for (var i = 0; i < $scope.guilds.length; i++)
          $scope.guilds[i].Points = parseFloat($scope.guilds[i].Points).toFixed(2);
      })
        .error(function (data, status, header, config) {
        console.log("[ERROR] $http.get request failed in rankController!");
      });

    };

  });

  app.controller('playerController', function($scope, $rootScope, $http, $stateParams, $state) {

    /* Retrieve character data */
    $http.get( app.api + "characters/" + $stateParams.id )
      .success(function (data, status, header, config) {
      $scope.character = data[0];

      // get faction
      if ($scope.character.race == 1 || $scope.character.race == 3 || $scope.character.race == 4 || $scope.character.race == 7 || $scope.character.race == 11)
        $scope.character.faction = "alliance";
      else
        $scope.character.faction = "horde";

      $rootScope.faction = $scope.character.faction;
    })
      .error(function (data, status, header, config) {
      console.log("[ERROR] $http.get request failed in playerController!");
    });

    /* Retrieve azth Points */
    $http.get( app.api + "character_achievement?guid=" + $stateParams.id )
      .success(function (data, status, header, config) {
      $rootScope.charPoints = data[0].Points;
    })
      .error(function (data, status, header, config) {
      console.log("[ERROR] $http.get request failed in playerController!");
    });

    /* Retrieve all achievement_category data */
    $http.get( app.api + "achievement_category" )
      .success(function (data, status, header, config) {

      /* Initialize all categories */
      $scope.categories = data;
      $scope.categoriesArray = [];

      for (var i = 0; i < $scope.categories.length; i++)
        $scope.categoriesArray[$scope.categories[i].ID] = $scope.categories[i].Name;

      /* Initialize parentCategories and collapseCategories */
      $scope.parentCategories = [];
      $scope.collapseCategory = [];

      for (var i = 0; i < $scope.categories.length; i++) {
        if ($scope.categories[i].ParentID == -1) {
          $scope.parentCategories.push($scope.categories[i]);
          $scope.collapseCategory.push(true);
        }
      }

      /* Initialize childCategories */
      $scope.childCategories = [];

      for (var i = 0; i < $scope.parentCategories.length; i++) {
        $scope.childCategories[i] = [];

        for (var j = 0; j < $scope.categories.length; j++) {
          if ($scope.categories[j].ParentID == $scope.parentCategories[i].ID)
            $scope.childCategories[i].push($scope.categories[j]);
        }

      }

      /* Manage Statistics (the last category with subcategories of childCategories) */
      $scope.childStatistics = [];
      $scope.collapseStatistics = [];

      // Get last category (Statistics)
      var statsIndex = $scope.childCategories.length-1;

      for (var i = 0; i < $scope.childCategories[statsIndex].length; i++) {
        $scope.childStatistics[i] = [];
        $scope.collapseStatistics[i] = true;

        for (var j = 0; j < $scope.categories.length; j++) {
          if ($scope.categories[j].ParentID == $scope.childCategories[statsIndex][i].ID)
            $scope.childStatistics[i].push($scope.categories[j]);
        }
      }

    })
      .error(function (data, status, header, config) {
      console.log("[ERROR] $http.get request failed in playerController!");
    });

    /* Manage categories and view */
    $scope.currentCategory = 92;

    $state.go('player.ach', {catId: $scope.currentCategory});

    $scope.showCategory = function(categoryIndex, parentCategoryId) {
      for (var i = 0; i < $scope.collapseCategory.length; i++)
        $scope.collapseCategory[i] = true;

      $scope.collapseCategory[categoryIndex] = !$scope.collapseCategory[categoryIndex];

      if ($scope.collapseCategory[categoryIndex] == false) {
        if (parentCategoryId != 1)
          $scope.updateCurrentCategory(parentCategoryId);
      }

      // if category is 'General' or 'Feast of Strength' re-change the collapse status
      if (parentCategoryId == 92 || parentCategoryId == 81)
        $scope.collapseCategory[categoryIndex] = !$scope.collapseCategory[categoryIndex];
    };

    $scope.collapseChildCategories = function(childCategoryId, Class, childCategoriesIndex) {
      // if the category is a subcategory of 'Statistics'
      if (Class == 'statistic')
      {
        // Get last category (Statistics)
        var statsIndex = $scope.childCategories.length-1;

        for (var i = 0; i < $scope.childCategories[statsIndex].length; i++)
          $scope.collapseStatistics[i] = true;

        if ($scope.collapseStatistics[childCategoriesIndex] == true)
          $scope.updateCurrentCategory(childCategoryId);

        $scope.collapseStatistics[childCategoriesIndex] = !$scope.collapseStatistics[childCategoriesIndex];

        // if category is 'Combat', 'Quests', 'Travel' or 'Social' re-change the collapse status
        if (childCategoryId == 141 || childCategoryId == 133 || childCategoryId == 134 || childCategoryId == 131)
          $scope.collapseStatistics[childCategoriesIndex] = !$scope.collapseStatistics[childCategoriesIndex];
      }
      else
        $scope.updateCurrentCategory(childCategoryId);
    };

    $scope.updateCurrentCategory = function(categoryId)
    {
      angular.element(document.getElementById($scope.currentCategory)).removeClass("selected");
      $scope.currentCategory = categoryId;
      angular.element(document.getElementById($scope.currentCategory)).addClass("selected");
    };

    $scope.collapseAllCategory = function() {
      console.log("collapsed");
    };

  });

  app.controller('achController', function($scope, $rootScope, $http, $stateParams, $state) {

    /* Check if the category passed in catId doesn't belong to the statistics subcategory */
    var statsCategoryId = [130,141,128,122,133,14807,132,134,131,21,123,135,140,152,178,14821,124,136,145,153,173,14822,125,137,147,154,14823,126,191,14963,127,15021,15062];

    var enablestats = true;
    for (var i = 0; i < statsCategoryId.length; i++) {
      if (statsCategoryId[i] == $stateParams.catId) {
        enablestats = false;
        break;
      }
    }

    if (!enablestats) {
      $state.go('player.stats', {statsId: $stateParams.catId});
      return;
    }

    /* Retrieve category data */
    $http.get( app.api + "achievement_category?id=" + $stateParams.catId )
      .success(function (data, status, header, config) {
      $scope.category = data[0];
    })
      .error(function (data, status, header, config) {
      console.log("[ERROR] $http.get request failed in achController!");
    });

    /* Retrieve character_achievements data */
    $http.get( app.api + "character_achievement/" + $stateParams.id + "?category=" + $stateParams.catId )
      .success(function (data, status, header, config) {

      $scope.character_achievements = data;

      /* Retrieve all achievements data */
      $http.get( app.api + "achievement?category=" + $stateParams.catId + "&faction=" + $rootScope.faction )
        .success(function (data, status, header, config) {

        $scope.achievements = data;
        for (var i = 0; i < $scope.achievements.length; i++) {

          if ($scope.achievements[i].icon == "NULL")
            $scope.achievements[i].icon = "trade_engineering";

          for (var j = 0; j < $scope.character_achievements.length; j++) {

            if ($scope.achievements[i].ID == $scope.character_achievements[j].ID) {
              $scope.achievements[i].class = "noopacity";
              break;
            }
            else
              $scope.achievements[i].class = "";
          }
        }

      })
        .error(function (data, status, header, config) {
        console.log("[ERROR] $http.get request failed in achController!");
      });

    })
      .error(function (data, status, header, config) {
      console.log("[ERROR] $http.get request failed in achController!");
    });

  });

  app.controller('statsController', function($scope, $rootScope, $http, $stateParams, $state) {

    /* Check if the category passed in statsId belong to the statistics subcategory */
    var statsCategoryId = [130,141,128,122,133,14807,132,134,131,21,123,135,140,152,178,14821,124,136,145,153,173,14822,125,137,147,154,14823,126,191,14963,127,15021,15062];

    var enablestats = false;
    for (var i = 0; i < statsCategoryId.length; i++) {
      if (statsCategoryId[i] == $stateParams.statsId) {
        enablestats = true;
        break;
      }
    }

    if (!enablestats) {
      $state.go('player.ach', {catId: $stateParams.statsId});
      return;
    }

    /* Retrieve category data */
    $http.get( app.api + "achievement_category?id=" + $stateParams.statsId )
      .success(function (data, status, header, config) {
      $scope.category = data[0];
    })
      .error(function (data, status, header, config) {
      console.log("[ERROR] $http.get request failed in statsController!");
    });

    /* Retrieve character_achievement_progress data */
    $http.get( app.api + "achievement_progress?guid=" + $stateParams.id + "&category=" + $stateParams.statsId )
      .success(function (data, status, header, config) {

      $scope.character_achievements = data;

      /* Retrieve all achievements data */
      $http.get( app.api + "achievement?category=" + $stateParams.statsId )
        .success(function (data, status, header, config) {

        $scope.achievements = data;
        for (var i = 0; i < $scope.achievements.length; i++) {

          $scope.achievements[i].counter = "-";
          for (var j = 0; j < $scope.character_achievements.length; j++) {

            if ($scope.achievements[i].ID == $scope.character_achievements[j].ID && $scope.character_achievements[j].counter > 0) {
              $scope.achievements[i].class = "noopacity";
              $scope.achievements[i].counter = $scope.character_achievements[j].counter;
              $scope.achievements[i].Quantity = $scope.character_achievements[j].Quantity;

              if ($scope.achievements[i].Quantity > 1 && $scope.achievements[i].counter != "-") {
                $scope.achievements[i].counter = parseInt($scope.achievements[i].counter);
                $scope.achievements[i].Quantity = parseInt($scope.achievements[i].Quantity);
              }

              if ($stateParams.statsId == 140 && $scope.achievements[i].ID != 329 && $scope.achievements[i].ID != 330) {

                // money conversion into gold, silver, copper
                var money = $scope.achievements[i].counter;
                var gold = '<img src="img/money/gold.png">';
                var silver = '<img src="img/money/silver.png">';
                var copper = '<img src="img/money/copper.png">';

                if (money > 9999)
                  money = money.substr(0, money.length-4) + ' ' + gold + ' ' + money.substr(-4, 2) + ' ' + silver + ' ' + money.substr(-2) + ' ' + copper;
                else if (money > 99)
                  money = '00 ' + gold + ' ' + money.substr(-4, 2) + ' ' + silver + ' ' + money.substr(-2) + ' ' +copper;
                else
                  money = '00 ' + gold + ' 00 ' + silver + ' ' + money.substr(-2) + copper;

                $scope.achievements[i].counter = money;
              }

              break;
            }
            else
              $scope.achievements[i].class = "";
          }
        }

      })
        .error(function (data, status, header, config) {
        console.log("[ERROR] $http.get request failed in statsController!");
      });

    })
      .error(function (data, status, header, config) {
      console.log("[ERROR] $http.get request failed in statsController!");
    });

  });

}());
