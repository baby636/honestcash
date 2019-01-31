import upvoteButton from './upvote-button/upvote-button.component';
import feed from './feed/component';
import feeds from './feeds/component';

angular
  .module('vqDirectives', ['vqConfig'])
  .directive('backImg', function() {
    return function(scope, element, attrs) {
      var url = attrs.backImg;
      element.css({
        'background-image': 'url(' + url + ')',
        'background-size': 'cover'
      });
    };
  })

  .directive('fallbackSrc', function() {
    var fallbackSrc = {
      link: function postLink(scope, iElement, iAttrs) {
        iElement.bind('error', function() {
          angular.element(this).attr('src', iAttrs.fallbackSrc);
        });
      }
    };
    return fallbackSrc;
  })
  .directive('feed', feed)
  .directive('feeds', feeds)
  .directive('upvoteButton', upvoteButton);