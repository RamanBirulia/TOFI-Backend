# TOFI-Backend
Backend part of TOFI project

# to run mongodb server 
mongod --dbpath=<path_to_project>/bears

# to run apiserver
node <path_to_project>/bin/www

# in case of server error string with error description is returned for now

# GET-REQUEST USING
# response signature for GET-requests with no params
# e.g. '/deals', 'deals/my', 'deals/closed', 'deals/opened'
{success: true || false, errors: {}, results: []}

# response signature for GET-requests with params (id for now; page/pageLimit in future)
# e.g. '/deals/:id', '/users/:id', '/instruments/:id'
# in case of successful request model entity is returned
{<_id and other model fields>}
# in case of wrong request result template with success == false is returned
{success: false, errors: {<here all the errors>}}

# USING: send GET-request ->
# 1. if typeof response is string -> server error
# 2. if response._id is defined -> single entity
# 3. if response.success is defined ->
# 3.1. if success == false -> check response.errors
# 3.2. if success == true -> check response.results
# ==========

