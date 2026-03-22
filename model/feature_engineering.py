import pandas as pd
import numpy as np
import networkx as nx
from collections import defaultdict
import datetime

class FeatureExtractor:
    def __init__(self, window_size_seconds=86400, max_graph_edges=100000):
        self.window_size_seconds = window_size_seconds
        self.max_graph_edges = max_graph_edges
        self.user_history = defaultdict(list)
        self.graph = nx.DiGraph()
        self.edge_queue = [] # To bound graph state memory

    def fit_transform(self, df):
        df = df.sort_values('timestamp').reset_index(drop=True)
        return self._extract_features(df)

    def transform(self, transactions):
        df = pd.DataFrame(transactions)
        if 'timestamp' in df.columns:
            df = df.sort_values('timestamp').reset_index(drop=True)
        return self._extract_features(df)

    def _extract_features(self, df):
        features = []
        
        timestamps = df['timestamp'].values
        senders = df['from'].values
        receivers = df['to'].values
        amounts = df['amount'].values

        for i in range(len(df)):
            t = float(timestamps[i])
            u = senders[i]
            v = receivers[i]
            amt = float(amounts[i])

            # Historical state
            hist = self.user_history[u]
            time_gap = t - hist[-1][0] if hist else 0.0

            # Prune old history outside window
            cutoff = t - self.window_size_seconds
            while hist and hist[0][0] < cutoff:
                hist.pop(0)

            tx_freq = len(hist)
            if tx_freq > 0:
                user_avg = sum(ha for ht, ha in hist) / tx_freq
            else:
                user_avg = amt
            
            amount_deviation = amt - user_avg

            # Sequence context features
            if len(hist) >= 3:
                recent_3 = hist[-3:]
                recent_3_amount_total = sum(h[1] for h in recent_3)
                recent_3_avg_time_gap = (recent_3[-1][0] - recent_3[0][0]) / 2.0
            else:
                recent_3_amount_total = sum(h[1] for h in hist)
                if len(hist) == 2:
                    recent_3_avg_time_gap = hist[1][0] - hist[0][0]
                else:
                    recent_3_avg_time_gap = 0.0

            # Unusual timing (e.g. 11 PM to 5 AM considered unusual = 1, else 0)
            dt = datetime.datetime.fromtimestamp(t)
            unusual_timing = 1 if (dt.hour < 6 or dt.hour > 22) else 0

            hist.append((t, amt))

            # Graph clean-up (bounded state)
            self.edge_queue.append((t, u, v))
            while self.edge_queue and (self.edge_queue[0][0] < cutoff or len(self.edge_queue) > self.max_graph_edges):
                old_t, old_u, old_v = self.edge_queue.pop(0)
                if self.graph.has_edge(old_u, old_v):
                    self.graph.remove_edge(old_u, old_v)

            # Graph update
            if self.graph.has_edge(u, v):
                self.graph[u][v]['weight'] += amt
            else:
                self.graph.add_edge(u, v, weight=amt)
            
            # Graph-based features
            cycle_detected = 0
            hop_count = 0

            if v in self.graph:
                try:
                    paths = nx.single_source_shortest_path_length(self.graph, v, cutoff=3)
                    if u in paths:
                        cycle_detected = 1
                        hop_count = paths[u] + 1
                except nx.NetworkXError:
                    pass

            unique_receivers = self.graph.out_degree(u) if u in self.graph else 0
            unique_connected = self.graph.degree(u) if u in self.graph else 0
            tx_velocity = self.graph.out_degree(u, weight='weight') if u in self.graph else 0

            features.append([
                amt, time_gap, tx_freq, amount_deviation, unusual_timing,
                tx_velocity, hop_count, cycle_detected, unique_connected,
                recent_3_amount_total, recent_3_avg_time_gap, unique_receivers
            ])

        return np.array(features)
