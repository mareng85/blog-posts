package se.switchcase.javasam;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;

import java.util.Map;

public class MainHandler implements RequestHandler<ApiGatewayProxyRequest, ApiGatewayProxyResponse> {

    @Override
    public ApiGatewayProxyResponse handleRequest(ApiGatewayProxyRequest request, Context context) {
        LambdaLogger logger = context.getLogger();
        logger.log("Query string params: " + request.getQueryStringParameters());
        Map<String, String> queryParams = request.getQueryStringParameters();
        /* Do domething useful */

        if (queryParams == null || queryParams.keySet().isEmpty()) {
            return new ApiGatewayProxyResponse.ApiGatewayProxyResponseBuilder()
                    .withBody("{\"status\":\"missing query params\"}")
                    .withStatusCode(400)
                    .build();
        } else {
            return new ApiGatewayProxyResponse.ApiGatewayProxyResponseBuilder()
                    .withBody("{\"status\":\"ok\"}")
                    .withStatusCode(200)
                    .build();
        }
    }
}
