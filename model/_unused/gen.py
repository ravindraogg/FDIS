import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

# Configuration
total_rows = 500000
data = []
start_date = datetime(2026, 1, 1, 8, 0, 0)

# 1. Generate Base (Normal) Data
print("Generating 500,000 rows...")
for i in range(total_rows):
    # Random timestamps over 90 days
    tx_time = start_date + timedelta(seconds=random.randint(0, 7776000))
    sender = random.randint(10000000, 19999999)
    receiver = random.randint(20000000, 29999999)
    amount = round(random.uniform(5.0, 450.0), 2)
    data.append([tx_time, sender, receiver, amount, "Normal"])

# 2. Inject Fraud Patterns (Manual Overwrites)
# Pattern: Circular (A -> B -> C -> A)
for j in range(0, 1000, 3): # Injecting multiple loops
    idx = random.randint(0, total_rows - 5)
    t = data[idx][0]
    data[idx]   = [t, 88880001, 88880002, 1200.00, "Fraud_Circular"]
    data[idx+1] = [t + timedelta(minutes=2), 88880002, 88880003, 1200.00, "Fraud_Circular"]
    data[idx+2] = [t + timedelta(minutes=4), 88880003, 88880001, 1200.00, "Fraud_Circular"]

# Pattern: Rapid Transfers (A -> B -> C)
for k in range(0, 500):
    idx = random.randint(0, total_rows - 5)
    t = data[idx][0]
    data[idx]   = [t, 77770001, 77770002, 5000.00, "Fraud_Rapid"]
    data[idx+1] = [t + timedelta(seconds=30), 77770002, 77770003, 5000.00, "Fraud_Rapid"]

# 3. Save to CSV
df = pd.DataFrame(data, columns=['Timestamp', 'Sender_Acc', 'Receiver_Acc', 'Amount', 'Pattern'])
df.to_csv('financial_data_5lakh.csv', index=False)
print("Success! 'financial_data_5lakh.csv' is ready.")