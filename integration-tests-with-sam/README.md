# Integration tests with Sam CLI
Resources for the blog post at https://switchcase.se/blog/posts/integration-tests-with-sam/

To build the project, run:
    
    mvn clean install
    
To start API Gateway locally, run:

    sam local start-api
  
To invoke the lambda function without using the AP Gateway mock, you could do something like:

    echo {} | sam local invoke MyLambdaFunction
