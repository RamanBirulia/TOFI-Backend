# TOFI-Backend
Backend part of TOFI project

# to run mongodb server 
mongod --dbpath=<path_to_project>/bears

# to run apiserver
node <path_to_project>/bin/www

## for all requests in case of server error string with error description is returned for now

# GET-REQUEST USING
## response signature for GET-requests with no params
## e.g. '/deals', 'deals/my', 'deals/closed', 'deals/opened'
{success: true || false, errors: {}, results: []}

##response signature for GET-requests with params (id for now; page/pageLimit in future)
##e.g. '/deals/:id', '/users/:id', '/instruments/:id'
##in case of successful request model entity is returned
{<_id and other model fields>}
##in case of wrong request result template with success == false is returned
{success: false, errors: {<here all the errors>}}

# USING: send GET-request ->
1. if typeof response is string -> server error 1
2. if response._id is defined -> single entity 2
3. if response.success is defined -> 3
    1. if success == false -> check response.errors 3.1
    2. if success == true -> check response.results 3.2

# POST-REQUEST USING
## response signature for POST-requests EXCEPT '/authenticate'
## e.g. '/register', '/deals', '/rates'
## in case of successful request model entity is returned
{<_id and other model fields>}
## in case of wrong request result template with success == false is returned
{success: false, errors: {<here all the errors>}}

# USING: send POST-request ->
1. if typeof response is string -> server error 1
2. if response._id is defined -> single entity 2
3. if response.success is defined -> 3
    1. if success == false -> check response.errors 3.1
    2. if success == true -> TELL ME CAUSE IT'S UNEXPECTED BEHAVIOR 3.2

# POST to '/authenticate' USING: send POST-request ->
1. if typeof response is string -> server error 1
2. if response.success is defined -> 2
    1. if success == false -> check response.errors 2.1
    2. if success == true -> token is in response.token 2.2

# PUT-REQUEST USING
## response signature for PUT-requests
## e.g. '/users/:id', '/deals/:id'
## in case of successful request model entity is returned
{<_id and other model fields>}
## in case of wrong request result template with success == false is returned
{success: false, errors: {<here all the errors>}}

# USING: send PUT-request ->
1. if typeof response is string -> server error 1
2. if response._id is defined -> single entity 2
3. if response.success is defined -> 3
    1. if success == false -> check response.errors 3.1
    2. if success == true -> TELL ME CAUSE IT'S UNEXPECTED BEHAVIOR 3.2