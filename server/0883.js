function(module, exports, __webpack_require__) {
    const utils = __webpack_require__(95), qs = __webpack_require__(28), {parseTimestamp: parseTimestamp} = __webpack_require__(217), BASE_URL = "https://www.youtube.com/watch?v=", TITLE_TO_CATEGORY = {
        song: {
            name: "Music",
            url: "https://music.youtube.com/"
        }
    }, getText = obj => obj ? obj.runs ? obj.runs[0].text : obj.simpleText : null;
    exports.getMedia = info => {
        let media = {}, results = [];
        try {
            results = info.response.contents.twoColumnWatchNextResults.results.results.contents;
        } catch (err) {}
        let result = results.find((v => v.videoSecondaryInfoRenderer));
        if (!result) return {};
        try {
            let metadataRows = (result.metadataRowContainer || result.videoSecondaryInfoRenderer.metadataRowContainer).metadataRowContainerRenderer.rows;
            for (let row of metadataRows) if (row.metadataRowRenderer) {
                let title = getText(row.metadataRowRenderer.title).toLowerCase(), contents = row.metadataRowRenderer.contents[0];
                media[title] = getText(contents);
                let runs = contents.runs;
                runs && runs[0].navigationEndpoint && (media[`${title}_url`] = new URL(runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url, BASE_URL).toString()), 
                title in TITLE_TO_CATEGORY && (media.category = TITLE_TO_CATEGORY[title].name, media.category_url = TITLE_TO_CATEGORY[title].url);
            } else if (row.richMetadataRowRenderer) {
                let contents = row.richMetadataRowRenderer.contents, boxArt = contents.filter((meta => "RICH_METADATA_RENDERER_STYLE_BOX_ART" === meta.richMetadataRenderer.style));
                for (let {richMetadataRenderer: richMetadataRenderer} of boxArt) {
                    let meta = richMetadataRenderer;
                    media.year = getText(meta.subtitle);
                    let type = getText(meta.callToAction).split(" ")[1];
                    media[type] = getText(meta.title), media[`${type}_url`] = new URL(meta.endpoint.commandMetadata.webCommandMetadata.url, BASE_URL).toString(), 
                    media.thumbnails = meta.thumbnail.thumbnails;
                }
                let topic = contents.filter((meta => "RICH_METADATA_RENDERER_STYLE_TOPIC" === meta.richMetadataRenderer.style));
                for (let {richMetadataRenderer: richMetadataRenderer} of topic) {
                    let meta = richMetadataRenderer;
                    media.category = getText(meta.title), media.category_url = new URL(meta.endpoint.commandMetadata.webCommandMetadata.url, BASE_URL).toString();
                }
            }
        } catch (err) {}
        return media;
    };
    const isVerified = badges => !(!badges || !badges.find((b => "Verified" === b.metadataBadgeRenderer.tooltip)));
    exports.getAuthor = info => {
        let channelId, subscriberCount, thumbnails = [], verified = !1;
        try {
            let videoOwnerRenderer = info.response.contents.twoColumnWatchNextResults.results.results.contents.find((v2 => v2.videoSecondaryInfoRenderer && v2.videoSecondaryInfoRenderer.owner && v2.videoSecondaryInfoRenderer.owner.videoOwnerRenderer)).videoSecondaryInfoRenderer.owner.videoOwnerRenderer;
            channelId = videoOwnerRenderer.navigationEndpoint.browseEndpoint.browseId, thumbnails = videoOwnerRenderer.thumbnail.thumbnails.map((thumbnail => (thumbnail.url = new URL(thumbnail.url, BASE_URL).toString(), 
            thumbnail))), subscriberCount = utils.parseAbbreviatedNumber(getText(videoOwnerRenderer.subscriberCountText)), 
            verified = isVerified(videoOwnerRenderer.badges);
        } catch (err) {}
        try {
            let videoDetails = info.player_response.microformat && info.player_response.microformat.playerMicroformatRenderer, id = videoDetails && videoDetails.channelId || channelId || info.player_response.videoDetails.channelId, author = {
                id: id,
                name: videoDetails ? videoDetails.ownerChannelName : info.player_response.videoDetails.author,
                user: videoDetails ? videoDetails.ownerProfileUrl.split("/").slice(-1)[0] : null,
                channel_url: `https://www.youtube.com/channel/${id}`,
                external_channel_url: videoDetails ? `https://www.youtube.com/channel/${videoDetails.externalChannelId}` : "",
                user_url: videoDetails ? new URL(videoDetails.ownerProfileUrl, BASE_URL).toString() : "",
                thumbnails: thumbnails,
                verified: verified,
                subscriber_count: subscriberCount
            };
            return thumbnails.length && utils.deprecate(author, "avatar", author.thumbnails[0].url, "author.avatar", "author.thumbnails[0].url"), 
            author;
        } catch (err) {
            return {};
        }
    };
    const parseRelatedVideo = (details, rvsParams) => {
        if (details) try {
            let viewCount = getText(details.viewCountText), shortViewCount = getText(details.shortViewCountText), rvsDetails = rvsParams.find((elem => elem.id === details.videoId));
            /^\d/.test(shortViewCount) || (shortViewCount = rvsDetails && rvsDetails.short_view_count_text || ""), 
            viewCount = (/^\d/.test(viewCount) ? viewCount : shortViewCount).split(" ")[0];
            let browseEndpoint = details.shortBylineText.runs[0].navigationEndpoint.browseEndpoint, channelId = browseEndpoint.browseId, name = getText(details.shortBylineText), user = (browseEndpoint.canonicalBaseUrl || "").split("/").slice(-1)[0], video = {
                id: details.videoId,
                title: getText(details.title),
                published: getText(details.publishedTimeText),
                author: {
                    id: channelId,
                    name: name,
                    user: user,
                    channel_url: `https://www.youtube.com/channel/${channelId}`,
                    user_url: `https://www.youtube.com/user/${user}`,
                    thumbnails: details.channelThumbnail.thumbnails.map((thumbnail => (thumbnail.url = new URL(thumbnail.url, BASE_URL).toString(), 
                    thumbnail))),
                    verified: isVerified(details.ownerBadges),
                    [Symbol.toPrimitive]: () => (console.warn("`relatedVideo.author` will be removed in a near future release, use `relatedVideo.author.name` instead."), 
                    video.author.name)
                },
                short_view_count_text: shortViewCount.split(" ")[0],
                view_count: viewCount.replace(/,/g, ""),
                length_seconds: details.lengthText ? Math.floor(parseTimestamp(getText(details.lengthText)) / 1e3) : rvsParams && `${rvsParams.length_seconds}`,
                thumbnails: details.thumbnail.thumbnails,
                richThumbnails: details.richThumbnail ? details.richThumbnail.movingThumbnailRenderer.movingThumbnailDetails.thumbnails : [],
                isLive: !(!details.badges || !details.badges.find((b => "LIVE NOW" === b.metadataBadgeRenderer.label)))
            };
            return utils.deprecate(video, "author_thumbnail", video.author.thumbnails[0].url, "relatedVideo.author_thumbnail", "relatedVideo.author.thumbnails[0].url"), 
            utils.deprecate(video, "ucid", video.author.id, "relatedVideo.ucid", "relatedVideo.author.id"), 
            utils.deprecate(video, "video_thumbnail", video.thumbnails[0].url, "relatedVideo.video_thumbnail", "relatedVideo.thumbnails[0].url"), 
            video;
        } catch (err) {}
    };
    exports.getRelatedVideos = info => {
        let rvsParams = [], secondaryResults = [];
        try {
            rvsParams = info.response.webWatchNextResponseExtensionData.relatedVideoArgs.split(",").map((e => qs.parse(e)));
        } catch (err) {}
        try {
            secondaryResults = info.response.contents.twoColumnWatchNextResults.secondaryResults.secondaryResults.results;
        } catch (err) {
            return [];
        }
        let videos = [];
        for (let result of secondaryResults || []) {
            let details = result.compactVideoRenderer;
            if (details) {
                let video = parseRelatedVideo(details, rvsParams);
                video && videos.push(video);
            } else {
                let autoplay = result.compactAutoplayRenderer || result.itemSectionRenderer;
                if (!autoplay || !Array.isArray(autoplay.contents)) continue;
                for (let content of autoplay.contents) {
                    let video = parseRelatedVideo(content.compactVideoRenderer, rvsParams);
                    video && videos.push(video);
                }
            }
        }
        return videos;
    }, exports.getLikes = info => {
        try {
            let like = info.response.contents.twoColumnWatchNextResults.results.results.contents.find((r => r.videoPrimaryInfoRenderer)).videoPrimaryInfoRenderer.videoActions.menuRenderer.topLevelButtons.find((b => b.toggleButtonRenderer && "LIKE" === b.toggleButtonRenderer.defaultIcon.iconType));
            return parseInt(like.toggleButtonRenderer.defaultText.accessibility.accessibilityData.label.replace(/\D+/g, ""));
        } catch (err) {
            return null;
        }
    }, exports.getDislikes = info => {
        try {
            let dislike = info.response.contents.twoColumnWatchNextResults.results.results.contents.find((r => r.videoPrimaryInfoRenderer)).videoPrimaryInfoRenderer.videoActions.menuRenderer.topLevelButtons.find((b => b.toggleButtonRenderer && "DISLIKE" === b.toggleButtonRenderer.defaultIcon.iconType));
            return parseInt(dislike.toggleButtonRenderer.defaultText.accessibility.accessibilityData.label.replace(/\D+/g, ""));
        } catch (err) {
            return null;
        }
    }, exports.cleanVideoDetails = (videoDetails, info) => (videoDetails.thumbnails = videoDetails.thumbnail.thumbnails, 
    delete videoDetails.thumbnail, utils.deprecate(videoDetails, "thumbnail", {
        thumbnails: videoDetails.thumbnails
    }, "videoDetails.thumbnail.thumbnails", "videoDetails.thumbnails"), videoDetails.description = videoDetails.shortDescription || getText(videoDetails.description), 
    delete videoDetails.shortDescription, utils.deprecate(videoDetails, "shortDescription", videoDetails.description, "videoDetails.shortDescription", "videoDetails.description"), 
    videoDetails.lengthSeconds = info.player_response.microformat && info.player_response.microformat.playerMicroformatRenderer.lengthSeconds || info.player_response.videoDetails.lengthSeconds, 
    videoDetails), exports.getStoryboards = info => {
        const parts = info.player_response.storyboards && info.player_response.storyboards.playerStoryboardSpecRenderer && info.player_response.storyboards.playerStoryboardSpecRenderer.spec && info.player_response.storyboards.playerStoryboardSpecRenderer.spec.split("|");
        if (!parts) return [];
        const url = new URL(parts.shift());
        return parts.map(((part, i) => {
            let [thumbnailWidth, thumbnailHeight, thumbnailCount, columns, rows, interval, nameReplacement, sigh] = part.split("#");
            url.searchParams.set("sigh", sigh), thumbnailCount = parseInt(thumbnailCount, 10), 
            columns = parseInt(columns, 10), rows = parseInt(rows, 10);
            const storyboardCount = Math.ceil(thumbnailCount / (columns * rows));
            return {
                templateUrl: url.toString().replace("$L", i).replace("$N", nameReplacement),
                thumbnailWidth: parseInt(thumbnailWidth, 10),
                thumbnailHeight: parseInt(thumbnailHeight, 10),
                thumbnailCount: thumbnailCount,
                interval: parseInt(interval, 10),
                columns: columns,
                rows: rows,
                storyboardCount: storyboardCount
            };
        }));
    }, exports.getChapters = info => {
        const playerOverlayRenderer = info.response && info.response.playerOverlays && info.response.playerOverlays.playerOverlayRenderer, playerBar = playerOverlayRenderer && playerOverlayRenderer.decoratedPlayerBarRenderer && playerOverlayRenderer.decoratedPlayerBarRenderer.decoratedPlayerBarRenderer && playerOverlayRenderer.decoratedPlayerBarRenderer.decoratedPlayerBarRenderer.playerBar, markersMap = playerBar && playerBar.multiMarkersPlayerBarRenderer && playerBar.multiMarkersPlayerBarRenderer.markersMap, marker = Array.isArray(markersMap) && markersMap.find((m => m.value && Array.isArray(m.value.chapters)));
        return marker ? marker.value.chapters.map((chapter => ({
            title: getText(chapter.chapterRenderer.title),
            start_time: chapter.chapterRenderer.timeRangeStartMillis / 1e3
        }))) : [];
    };
}
