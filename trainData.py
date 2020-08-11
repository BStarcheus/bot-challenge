# Can be used to generate training data for the model

import random
from math import floor, sin
import json

height = 20
width = 20

def create(equation):
    """ 
    Given an equation create a binary 
    representation of the black and white image
    """
    binary = []
    for row in range(height):
        rowBin = []
        for col in range(width):
            if eval(equation):
                rowBin.append(1)
            else:
                rowBin.append(0)
            
        binary.append(rowBin)
    return binary

def randomQuadratic():
    op = '>'
    if random.random() < 0.5:
        op = '<'
    
    m = random.random() + 0.3
    b = floor(random.random() * 10 - 5)
    return f'col {op} {m}*(row - 10)**2 + {b}'


def randomLinearAbs():
    op = '>'
    if random.random() < 0.5:
        op = '<'
    
    m = random.random() * 3 + 0.5
    b = floor(random.random() * 10 - 5)
    return f'col {op} abs({m}*(row - 10)) + {b}'


def randomWavy():
    op = '>'
    if random.random() < 0.5:
        op = '<'
    
    m = random.random() * 3 + 0.4
    b = floor(random.random() * 10 - 5)
    return f'col {op} abs({m}*(row - 10)) + 1.5 * sin(row - 10) + {b}'




def getTrainingData(num, outputFile=None):
    """
    Input the number of datapoints per class.
    By default no output file is generated.
    return: List of training data
    """

    train = []
    for i in range(num):
        train.append([create(randomQuadratic()), 0])
        train.append([create(randomLinearAbs()), 1])
        train.append([create(randomWavy()), 2])

    if outputFile is not None and isinstance(outputFile, str):
        with open(outputFile, 'w') as f:
            f.write(json.dumps(train))
    
    return train