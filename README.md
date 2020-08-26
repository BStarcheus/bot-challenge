# bot-challenge
Go against a machine learning model in classifying images!

[Live Demo](https://hummushacks.github.io/bot)

My goal for this project was to get an introduction to
machine learning and to test the limitations of both humans
and machines when trained with very little data.
The machine learning model is trained with 60 inputs and
the user is trained with only 6. Which will perform better?

The data is randomly generated 20x20 black and white images
which follow certain patterns. Each of the 3 patterns has a label.
The task of both the user and the "bot" is to learn the
patterns and guess the labels of new images.
Humans are great at recognizing patterns, so to make
this "fight" more fair the labels were given very similar
names and the user is only given 3 seconds per image.

After the user takes the quiz on the frontend, the backend
creates the model and tests the 5 randomly generated data
points from the quiz. Now that we have the "guesses" from
the user and the "bot" we can compare their performance.

## Usage
First navigate to the backend directory.

You can run locally with Python:
```
pip3 install -r requirements3.txt
python3 app.py
```

or build and run with Docker:
```
docker build --tag botch .
PORT=8080 && docker run -p 9090:${PORT} -e PORT=${PORT} -it --name bc botch
```

The frontend currently submits to my Google Cloud Run container.
To run locally, replace the form submission in
[script.js](https://github.com/BStarcheus/bot-challenge/blob/c226cc6996ed64420d8383d782a7b7bb3d2219e5/frontend/script.js#L204)
to the proper localhost port (8080 for Python, 9090 for Docker).

Additionally, you can use `trainData.py` if you wish to generate
more data to see the results of changing the amount of
training data on the performance of the model.