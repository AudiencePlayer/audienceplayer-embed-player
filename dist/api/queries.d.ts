export declare const articleAssetPlayMutation = "\n    mutation ArticleAssetPlay($articleId: Int, $assetId: Int, $protocols: [ArticlePlayProtocolEnum]) {\n        ArticleAssetPlay(article_id: $articleId, asset_id: $assetId, protocols: $protocols) {\n            article_id\n            asset_id\n            entitlements {\n                mime_type\n                protocol\n                manifest\n                token\n                encryption_type\n                key_delivery_url\n                encryption_provider\n                content_key_id\n                media_provider\n            }\n            subtitles {\n                url\n                locale\n                locale_label\n            }\n            pulse_token\n            appa\n            appr\n            fairplay_certificate_url\n            user_subtitle_locale\n            user_audio_locale\n            aspect_ratio\n            issued_at\n            time_marker_end\n        }\n    }\n";
export declare const articleQuery = "\n    query Article($articleId: Int!) {\n        Article(id: $articleId) {\n            id\n            name\n            metas {\n                key\n                value\n            }\n            assets {\n                id\n                duration\n                linked_type\n                accessibility\n            }\n            posters {\n                type\n                url\n                title\n                base_url\n                file_name\n            }\n            images {\n                type\n                url\n                title\n                base_url\n                file_name\n            }\n        }\n    }\n";
