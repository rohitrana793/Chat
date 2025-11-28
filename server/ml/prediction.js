import * as tf from "@tensorflow/tfjs-node";

// Dummy LSTM model for typing prediction
let model;

export async function loadModel() {
  if (!model) {
    model = tf.sequential();
    model.add(tf.layers.lstm({ units: 16, inputShape: [5, 1] }));
    model.add(tf.layers.dense({ units: 1, activation: "linear" }));
    model.compile({ loss: "meanSquaredError", optimizer: "adam" });
  }
  return model;
}

// Predict typing time based on last 5 intervals
export async function predictTyping(intervals) {
  const model = await loadModel();

  const input = tf.tensor(intervals).reshape([1, intervals.length, 1]);
  const output = model.predict(input);
  const result = output.dataSync()[0];

  return { predictedMilliseconds: result };
}
