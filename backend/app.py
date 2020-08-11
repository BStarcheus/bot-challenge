import os
import tensorflow as tf
import numpy as np
import json
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/', methods=["POST"])
@cross_origin()
def testImages():
    if request.method != "POST":
        return jsonify({"error":f"Invalid request type {request.method}"})
    if not request.json:
        return jsonify({"error":"No data provided."})
    r = request.json
    
    try:
        inpImages = r['images']
        modelAns = test(getTrainedModel(), inpImages)
        msg = validateAnswers(r['userAnswers'], modelAns, r['correctAnswers'])
        return jsonify({"msg": msg, 'modelAns': modelAns})
    except Exception as e:
        print(e)
        return jsonify({"error":"Internal error"})

def validateAnswers(userAns, modelAns, correctAns):
    """ Count the scores of the user and model """
    userScore = 0
    modelScore = 0

    for i in range(len(correctAns)):
        if correctAns[i] == userAns[i]:
            userScore += 1
        if correctAns[i] == modelAns[i]:
            modelScore += 1

    if userScore > modelScore:
        return "You won!\nClue: e5e897cfa16eae"
    elif userScore == modelScore:
        return "You tied the bot!\nTry again and beat its score to get the clue."
    else:
        return "The bot beat you. Keep trying to beat its score!"

def getTrainedModel():
    """ Train a model with the training data """

    with open('trainingData.json', 'r') as f:
        data = json.load(f)

    x_train = []
    y_train = []
    for d in data:
        x_train.append(d[0])
        y_train.append(d[1])
    x_train = np.asarray(x_train)
    y_train = np.asarray(y_train)
    
    model = tf.keras.models.Sequential([
        tf.keras.layers.Flatten(input_shape=(20, 20)),
        tf.keras.layers.Dense(400, activation='relu'),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(300),
        tf.keras.layers.Dense(3)
    ])
    loss_fn = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True)
    model.compile(optimizer='adam',
        loss=loss_fn,
        metrics=['accuracy'])

    model.fit(x_train, y_train, epochs=10)
    return model

def test(model, data):
    """ Get model predictions for the input data """

    x_test = np.asarray(data)
    testAns = model.predict(x_test)
    testAns = [int(np.argmax(x)) for x in testAns]
    return testAns

if __name__ == "__main__":
    app.run(debug=True,host='0.0.0.0',port=int(os.environ.get('PORT', 8080)))