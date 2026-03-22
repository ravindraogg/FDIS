import pandas as pd
import numpy as np
import joblib
import time
from sklearn.ensemble import IsolationForest
from feature_engineering import FeatureExtractor

def train_model(dataset_path='financial_data_5lakh.csv', model_path='fraud_model.pkl'):
    print(f"Loading dataset from {dataset_path}...")
    df = pd.read_csv(dataset_path)

    # Standardize column names to match JSON format expectations
    df.rename(columns={
        'Timestamp': 'timestamp',
        'Sender_Acc': 'from',
        'Receiver_Acc': 'to',
        'Amount': 'amount'
    }, inplace=True)

    # Convert timestamp strings to UNIX epochs
    print("Converting timestamps to UNIX epochs...")
    df['timestamp'] = pd.to_datetime(df['timestamp']).astype('int64') // 10**9

    print("Extracting features... this may take some time depending on dataset size.")
    extractor = FeatureExtractor(window_size_seconds=86400)  # 24 hours window
    
    start_time = time.time()
    # For large datasets, taking a sample or printing progress is usually good.
    X_train = extractor.fit_transform(df)
    print(f"Feature extraction completed in {time.time() - start_time:.2f} seconds.")

    print(f"Training Isolation Forest on {X_train.shape[0]} samples with {X_train.shape[1]} features...")
    # Initialize Isolation Forest Model
    # Contamination is set to ~0.05 per requirement
    model = IsolationForest(
        n_estimators=100,
        max_samples='auto',
        contamination=0.05,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train)

    print("Saving model and preprocessor (FeatureExtractor state)...")
    # Save the model and the feature extractor together in a dictionary
    pipeline = {
        'model': model,
        'extractor': extractor
    }
    joblib.dump(pipeline, model_path)
    print(f"Saved successfully to {model_path}.")

    # Evaluate on the training set to show a sample summary
    preds = model.predict(X_train)
    scores = model.decision_function(X_train)
    
    anomalies = X_train[preds == -1]
    normal = X_train[preds == 1]
    
    print("\n--- Training Summary ---")
    print(f"Total Transactions:   {len(X_train)}")
    print(f"Normal Detected:      {len(normal)}")
    print(f"Anomalies Detected:   {len(anomalies)}")
    
    print("\n--- Sample Anomaly Predictions ---")
    anomaly_indices = np.where(preds == -1)[0]
    sample_indices = np.random.choice(anomaly_indices, size=min(5, len(anomaly_indices)), replace=False)
    
    for idx in sample_indices:
        print(f"Transaction Index: {idx}")
        print(f"  Features vector: {X_train[idx]}")
        print(f"  Anomaly Score: {scores[idx]:.4f} (Negative means anomaly)")
        if 'Pattern' in df.columns:
            print(f"  True Label (if any): {df.iloc[idx]['Pattern']}")
        print("-" * 30)

if __name__ == "__main__":
    train_model()
