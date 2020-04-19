const { app } = require('geysertimes-graphql-core');

app.set( 'port', process.env.PORT || 5000 );

app.listen(
	app.get('port'),
	() => {
		const port = app.get('port');
		console.log('GraphQL Server Running at http://127.0.0.1:' + port );
	}
);