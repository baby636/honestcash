export default class FeedsCtrl {
  constructor($rootScope, $scope, $stateParams, $location, $http, FeedService, PostService) {
		$scope.feeds = [];
		$scope.page = 1;
		$scope.limit = 10;
		$rootScope.isLoading = true;
		$scope.postsAvailable = true;
		$scope.hashtagFollowed = false;
		$scope.hashtag = $stateParams.hashtag;

		const feedType = location.pathname === "/" ? "userfeed" : "all";

		$scope.feedType = feedType;

		if ($scope.hashtag) {
			$http.get("/api/hashtag/" + $scope.hashtag).then((response) => {
				
				$scope.hashtagInfo = response.data;
			});
		}

		$scope.sortType = "new";
		$scope.filterType = $location.search()["filter"] ? $location.search()["filter"] : null;
		$scope.recommendedHashtags = [];
		$scope.recommendedProfiles = [];

		$scope.fetchPost = (postId, index) => {
			$http.get("/post/" + postId).then((response) => {
				$scope.feeds[index].body = response.data.post_body;
				$scope.feeds[index].isFull = true;
			});
		};

		$scope.removePost = (feed, isDraft, $index) => {
			bootbox.confirm("Are you sure?", (result) => {
				if (result) {
					PostService.removePost(feed.id);
					return (isDraft) ? $scope.drafts.splice($index, 1) : $scope.feeds.splice($index, 1);
				}
			});
		};

		$scope.fetchFeeds = () => {
			const obj = {
				page: $scope.page,
				hashtag: $scope.hashtag,
			};

			if (feedType === "userfeed") {
				obj.followerId = $rootScope.user ? $rootScope.user.id : undefined;
			}

			FeedService.fetchFeeds(obj, (data) => {
				if (data) {
					data.forEach((feed) => {
						$scope.feeds.push(feed);
					});

					if (data.length < $scope.limit) {
						$scope.postsAvailable = false;
					} else {
						$scope.postsAvailable = true;
					}
				} else {
					$scope.postsAvailable = false;
				}

				$rootScope.isLoading = false;
			});
		};

		$scope.fetchFeeds();

		$scope.loadMore = () => {
			if (!$rootScope.activeCalls && $scope.postsAvailable) {
				$scope.page = $scope.page + 1;
				$scope.fetchFeeds();
			}
		};
  }
}

FeedsCtrl.$inject = [ "$rootScope", "$scope", "$stateParams", "$location", "$http", "FeedService", "PostService" ];