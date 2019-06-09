/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  // this.timeout(65000);
  
  let replyId;
  let deleteThreadId;
  let reportThreadId;

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test("/api/threads/testboard with no fields filled", function(done) {
        chai.request(server)
          .post('/api/threads/testboard')
          .then(res => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "Please enter text")
          done();
        });
      });
      
      test("/api/threads/testboard with no text field", function(done) {
        chai.request(server)
          .post('/api/threads/testboard')
          .send({delete_password: "deleteme"})
          .then(res => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "Please enter text")
          done();
        });
      });
      
      test("/api/threads/:board with no delete_password field", function(done) {
        chai.request(server)
          .post('/api/threads/testboard')
          .send({text: "Test Text"})
          .then(res => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "Please enter delete_password")
          done();
        });
      });
      
      test("/api/threads/testboard with all fields filled", function(done) {
        // Post eleven boards to check if at most 10 are returned in the get request
        // Will check if everything worked correctly at get request
        chai.request(server)
          .post('/api/threads/testboard')
          .send({text: "Test Text 1", delete_password: "deleteme"})
          .then(res => {
          assert.equal(res.status, 200);
          
          chai.request(server)
            .post('/api/threads/testboard')
            .send({text: "Test Text 2", delete_password: "deleteme"})
            .then(res => {
            assert.equal(res.status, 200);

            chai.request(server)
              .post('/api/threads/testboard')
              .send({text: "Test Text 3", delete_password: "deleteme"})
              .then(res => {
              assert.equal(res.status, 200);

              chai.request(server)
                .post('/api/threads/testboard')
                .send({text: "Test Text 4", delete_password: "deleteme"})
                .then(res => {
                assert.equal(res.status, 200);

                chai.request(server)
                  .post('/api/threads/testboard')
                  .send({text: "Test Text 5", delete_password: "deleteme"})
                  .then(res => {
                  assert.equal(res.status, 200);

                  chai.request(server)
                    .post('/api/threads/testboard')
                    .send({text: "Test Text 6", delete_password: "deleteme"})
                    .then(res => {
                    assert.equal(res.status, 200);

                    chai.request(server)
                      .post('/api/threads/testboard')
                      .send({text: "Test Text 7", delete_password: "deleteme"})
                      .then(res => {
                      assert.equal(res.status, 200);

                      chai.request(server)
                        .post('/api/threads/testboard')
                        .send({text: "Test Text 8", delete_password: "deleteme"})
                        .then(res => {
                        assert.equal(res.status, 200);

                        chai.request(server)
                          .post('/api/threads/testboard')
                          .send({text: "Delete me", delete_password: "deleteme"})
                          .then(res => {
                          assert.equal(res.status, 200);

                          chai.request(server)
                            .post('/api/threads/testboard')
                            .send({text: "Report me", delete_password: "deleteme"})
                            .then(res => {
                            assert.equal(res.status, 200);

                            chai.request(server)
                              .post('/api/threads/testboard')
                              .send({text: "Reply to me", delete_password: "deleteme"})
                              .then(res => {
                              assert.equal(res.status, 200);
                              done();
                              
                            }).catch(err => {console.error("11th error: " +err)});
                          }).catch(err => {console.error("10th error: " +err)});
                        }).catch(err => {console.error("9th error: " +err)});
                      }).catch(err => {console.error("8th error: " +err)});
                    }).catch(err => {console.error("7th error: " +err)});
                  }).catch(err => {console.error("6th error: " +err)});
                }).catch(err => {console.error("5th error: " +err)});
              }).catch(err => {console.error("4th error: " +err)});
            }).catch(err => {console.error("3rd error: " +err)});
          }).catch(err => {console.error("2nd error: " +err)});
        }).catch(err => {console.error("1st error: " +err)});
      });
    });
    
    suite('GET', function() {
      test("/api/threads/testboard", function(done) {
        chai.request(server)
          .get('/api/threads/testboard')
          .end(function(err, res) {
          if (res.body[0]) {
            replyId = res.body[0]._id;
          }
          if (res.body[1]) {
            reportThreadId = res.body[1]._id;
          }
          if (res.body[2]) {
            deleteThreadId = res.body[2]._id;
          }
          
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.equal(res.body.length, 10);
          for (let i = 0; i < 10; i++) {
            assert.property(res.body[i], "_id");
            assert.property(res.body[i], "text");
            assert.property(res.body[i], "created_on");
            assert.property(res.body[i], "bumped_on");
            assert.property(res.body[i], "replies");
            assert.isArray(res.body[i].replies);
          }
          
          done();
        });
      });
    });
    
    suite('DELETE', function() {
      test("/api/threads/testboard incorrect password", function(done) {
        chai.request(server)
          .delete('/api/threads/testboard')
          .send({ thread_id: deleteThreadId,  delete_password: "NotErty"})
          .then(res => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "incorrect password");
          
          done();
        });
      });
      
      test("/api/threads/testboard incorrect id", function(done) {
        chai.request(server)
          .delete('/api/threads/testboard')
          .send({ thread_id: "invalid",  delete_password: "erty"})
          .then(res => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "incorrect ID");
          
          done();
        });
      });
      
      test("/api/threads/testboard", function(done) {
        chai.request(server)
          .delete('/api/threads/testboard')
          .send({ thread_id: deleteThreadId,  delete_password: "deleteme"})
          .then(res => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "success");
          
          done();
        });
      });
    });
    
    suite('PUT', function() {
      
      test("/api/threads/testboard", function(done) {
        chai.request(server)
          .put('/api/threads/testboard')
          .send({ thread_id: reportThreadId })
          .then(res => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "success");
          
          done();
        });
      });
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      
      test("/api/replies/testboard", function(done) {
        chai.request(server)
          .post('/api/replies/testboard')
          .send({thread_id: replyId, text: "reply", delete_password: "goodbye"})
          .then(res => {
          assert.equal(res.status, 200);
          
          done();
        });
      });
      
    });
    
    let reportedReplyId;
    
    suite('GET', function() {
      test("/api/replies/testboard", function(done) {
        chai.request(server)
          .get('/api/replies/testboard')
          .query({thread_id: replyId})
          .then(res => {
          reportedReplyId = res.body[0].replies[0]._id;
          
          assert.equal(res.status, 200);
          assert.property(res.body[0].replies[0], "text");
          
          done();
        });
      });
    });
    
    suite('PUT', function() {
      test("/api/replies/testboard", function(done) {
        chai.request(server)
          .put('/api/replies/testboard')
          .send({thread_id: replyId, reply_id: reportedReplyId})
          .then(res => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "success");
          
          done();
        });
      });
    });
    
    suite('DELETE', function() {
      test("/api/replies/testboard correct password", function(done) {
        chai.request(server)
          .delete('/api/replies/testboard')
          .send({thread_id: replyId, reply_id: reportedReplyId, delete_password: "goodbye"})
          .then(res => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "success");
          
          done();
        });
      });
      
      
      test("/api/replies/testboard incorrect password", function(done) {
        chai.request(server)
          .delete('/api/replies/testboard')
          .send({thread_id: replyId, reply_id: reportedReplyId, delete_password: "incorrect"})
          .then(res => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "incorrect password");
          
          done();
        });
      });
    });
    
  });

});
