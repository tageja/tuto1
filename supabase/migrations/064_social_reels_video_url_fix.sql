-- Migration: 064_social_reels_video_url_fix.sql
-- Fix BUG-016: test-videos.co.uk URLs return 404. Replace with working Google sample URL.

UPDATE social_reels
SET video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
WHERE video_url LIKE '%test-videos.co.uk%';
