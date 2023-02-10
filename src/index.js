const express = require("express"); 
const axios = require('axios');

const app = express(); 
const PORT = process.env.PORT || 8080; 
const endpoints = [
  'https://jsonplaceholder.typicode.com/comments',
  'https://jsonplaceholder.typicode.com/posts'
];


app.get("/top_posts", (req, res) => { 
  Promise.all(endpoints.map((endpoint) => axios.get(endpoint)))
  .then(([
    { data: comments }, 
    { data: posts }, 
    ]) => {
      const data = [];

      // get all distinct postId from comments
      const allPostId = comments.map(comment => comment.postId)
        .filter((value, index, self) => self.indexOf(value) === index);
      
      allPostId.forEach(id => {
        // count each post got how many comments
        const count = comments.filter(comment => comment.postId === id).length;
  
        // get each postId details
        const postDetail = posts.filter(post => post.id === id)[0];
        data.push({
          post_id: id,
          total_number_of_comments: count,
          post_title: postDetail.title,
          post_body: postDetail.body
        })
      });

      // sort the most comments of a post
      data.sort((a,b) => a.total_number_of_comments - b.total_number_of_comments);
      res.json(data);
  });
});


app.get("/filter_comments", (req, res) => {
  const data = [];

  axios.get('https://jsonplaceholder.typicode.com/comments')
  .then(response => {
    allComments = response.data;

    const filterKey = Object.keys(allComments[0]);
    const param = req.query;
    let search = {};

    // to check the request filter key availability
    Object.keys(param).forEach((key) => {
      if(filterKey.indexOf(key) <= -1) {
        console.error('invalid filter keywords', key);
        res.status(500).send({ error: 'Invalid filter keywords!', key })
      }

      if(key === 'postId' || key === 'id') {
        search[key] = param[key];
        const result = allComments.filter(comment => comment[key].toString() === param[key].toString());
        result.forEach(res => {
          data.push(res);
        })
      } else {
        const result = allComments.filter(comment => comment[key].includes((param[key]).trim()));
        result.forEach(res => {
          data.push(res);
        })
      }
    });

    const uniqueData = [...new Map(data.map(item => [item.id, item])).values()];
    res.json(uniqueData);
  })
  .catch(error => {
    console.log(error);
  });

});

app.listen(PORT, () => { 
    console.log(`API is listening on port ${PORT}`); 
});