Here are example curl commands to test the API endpoints with your API
  key:

  1. Add a General Note

  curl -X POST http://localhost:3000/api/chrome-extension/idea-inbox/text
   \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer 
  gencbeta_6tvHfmn44drXsoIoav7FE0KQVAu7u1cX7t20JOWxiRM" \
    -d '{
      "title": "Content Strategy Ideas",
      "content": "Focus on authentic storytelling and behind-the-scenes 
  content to build trust with Gen Z audience",
      "noteType": "note"
    }'

  2. Add a TikTok Video

  curl -X POST
  http://localhost:3000/api/chrome-extension/idea-inbox/video \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer 
  gencbeta_6tvHfmn44drXsoIoav7FE0KQVAu7u1cX7t20JOWxiRM" \
    -d '{
      "url": 
  "https://www.tiktok.com/@zachking/video/7234567890123456789",
      "title": "Viral Magic Trick Analysis"
    }'

  3. Add an Instagram Reel

  curl -X POST
  http://localhost:3000/api/chrome-extension/idea-inbox/video \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer 
  gencbeta_6tvHfmn44drXsoIoav7FE0KQVAu7u1cX7t20JOWxiRM" \
    -d '{
      "url": "https://www.instagram.com/reel/C1234567890AB",
      "title": "Fashion Trend to Research"
    }'

  4. Add Multiple Notes (Different Types)

  YouTube Video

  curl -X POST
  http://localhost:3000/api/chrome-extension/idea-inbox/video \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer 
  gencbeta_6tvHfmn44drXsoIoav7FE0KQVAu7u1cX7t20JOWxiRM" \
    -d '{
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "title": "Classic Video Reference"
    }'

  Another TikTok

  curl -X POST
  http://localhost:3000/api/chrome-extension/idea-inbox/video \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer 
  gencbeta_6tvHfmn44drXsoIoav7FE0KQVAu7u1cX7t20JOWxiRM" \
    -d '{
      "url": "https://www.tiktok.com/@mrbeast/video/7345678901234567890",
      "title": "Viral Challenge Format"
    }'

  Marketing Note

  curl -X POST http://localhost:3000/api/chrome-extension/idea-inbox/text
   \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer 
  gencbeta_6tvHfmn44drXsoIoav7FE0KQVAu7u1cX7t20JOWxiRM" \
    -d '{
      "title": "Influencer Campaign Ideas",
      "content": "Partner with micro-influencers in the 10K-50K follower 
  range for better engagement rates",
      "noteType": "note"
    }'

  5. Query Notes by Type

  Get all notes

  curl -X GET "http://localhost:3000/api/notes" \
    -H "Authorization: Bearer 
  gencbeta_6tvHfmn44drXsoIoav7FE0KQVAu7u1cX7t20JOWxiRM"

  Get only TikTok notes

  curl -X GET "http://localhost:3000/api/notes?noteType=tiktok" \
    -H "Authorization: Bearer 
  gencbeta_6tvHfmn44drXsoIoav7FE0KQVAu7u1cX7t20JOWxiRM"

  Get only Instagram notes

  curl -X GET "http://localhost:3000/api/notes?noteType=instagram" \
    -H "Authorization: Bearer 
  gencbeta_6tvHfmn44drXsoIoav7FE0KQVAu7u1cX7t20JOWxiRM"

  Get general notes

  curl -X GET "http://localhost:3000/api/notes?noteType=note" \
    -H "Authorization: Bearer 
  gencbeta_6tvHfmn44drXsoIoav7FE0KQVAu7u1cX7t20JOWxiRM"

  6. Using the General Notes API

  curl -X POST http://localhost:3000/api/notes \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer 
  gencbeta_6tvHfmn44drXsoIoav7FE0KQVAu7u1cX7t20JOWxiRM" \
    -d '{
      "title": "TikTok Algorithm Insights",
      "content": "The algorithm favors videos with high completion rates 
  and shares over likes",
      "noteType": "tiktok",
      "type": "idea_inbox",
      "starred": true
    }'

  7. Test with Real TikTok/Instagram URLs

  Real TikTok URL

  curl -X POST
  http://localhost:3000/api/chrome-extension/idea-inbox/video \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer 
  gencbeta_6tvHfmn44drXsoIoav7FE0KQVAu7u1cX7t20JOWxiRM" \
    -d '{
      "url": 
  "https://www.tiktok.com/@khaby.lame/video/7023470722535189765",
      "title": "Simple Solution Trend"
    }'

  Real Instagram Reel

  curl -X POST
  http://localhost:3000/api/chrome-extension/idea-inbox/video \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer 
  gencbeta_6tvHfmn44drXsoIoav7FE0KQVAu7u1cX7t20JOWxiRM" \
    -d '{
      "url": "https://www.instagram.com/reel/CzABCDEFGHI",
      "title": "Aesthetic Transition Ideas"
    }'

  Pretty Print JSON Response

  Add | python -m json.tool to any command for formatted output:

  curl -X GET "http://localhost:3000/api/notes?limit=5" \
    -H "Authorization: Bearer 
  gencbeta_6tvHfmn44drXsoIoav7FE0KQVAu7u1cX7t20JOWxiRM" \
    | python -m json.tool

  These commands will help you test all the different note types and
  verify the API is working correctly with the new noteType system.
