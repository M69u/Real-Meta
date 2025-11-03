import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input

# Load MobileNet once globally for efficiency
mobilenet = MobileNetV2(weights="imagenet", include_top=False, pooling="avg")

def get_embedding_from_bytes(image_bytes: bytes):
    """Convert uploaded image bytes to embedding"""
    img = tf.image.decode_image(image_bytes, channels=3)
    img = tf.image.resize(img, [224, 224])
    x = tf.expand_dims(img, axis=0)
    x = preprocess_input(x)
    embedding = mobilenet(x)
    return embedding.numpy().flatten()
