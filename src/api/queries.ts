export const articleAssetPlayMutation = `
    mutation ArticleAssetPlay($articleId: Int, $assetId: Int, $protocols: [ArticlePlayProtocolEnum]) {
        ArticleAssetPlay(article_id: $articleId, asset_id: $assetId, protocols: $protocols) {
            article_id
            asset_id
            entitlements {
                mime_type
                protocol
                manifest
                token
                encryption_type
                key_delivery_url
                encryption_provider
                content_key_id
            }
            subtitles {
                url
                locale
                locale_label
            }
            pulse_token
            appa
            appr
            fairplay_certificate_url
            user_subtitle_locale
            user_audio_locale
            aspect_ratio
            issued_at
            time_marker_end
        }
    }
`;

export const articleQuery = `
    query Article($articleId: Int!) {
        Article(id: $articleId) {
            id
            name
            metas {
                key
                value
            }
            assets {
                id
                duration
                linked_type
                accessibility
            }
            posters {
                type
                url
                title
                base_url
                file_name
            }
            images {
                type
                url
                title
                base_url
                file_name
            }
        }
    }
`;
