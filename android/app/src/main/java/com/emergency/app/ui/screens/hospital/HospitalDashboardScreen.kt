package com.emergency.app.ui.screens.hospital

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.emergency.app.viewmodels.MainViewModel
import kotlinx.coroutines.delay

@Composable
fun HospitalDashboardScreen(viewModel: MainViewModel) {
    LaunchedEffect(Unit) {
        while (true) {
            viewModel.fetchHospitaData()
            delay(5000) 
        }
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Hospital Dashboard", style = MaterialTheme.typography.headlineMedium)
        Text("Status: On Duty", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
        Spacer(modifier = Modifier.height(16.dp))

        if (viewModel.isLoading.value && viewModel.emergencies.value.isEmpty()) {
            CircularProgressIndicator()
        } else {
            LazyColumn {
                items(viewModel.emergencies.value) { item ->
                    Card(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("Patient: ${item.name}", style = MaterialTheme.typography.titleMedium)
                            Text("Risk: ${item.riskLevel}", color = when(item.riskLevel) {
                                "HIGH" -> androidx.compose.ui.graphics.Color.Red
                                "MEDIUM" -> androidx.compose.ui.graphics.Color(0xFFF57C00)
                                else -> androidx.compose.ui.graphics.Color(0xFF388E3C)
                            })
                            Text("Status: ${item.status}")
                            Text("AI Confidence: ${item.aiConfidence}%")
                            
                            Spacer(modifier = Modifier.height(8.dp))
                            Row {
                                if (item.riskLevel == "HIGH" && item.status == "Pending") {
                                    Button(onClick = { viewModel.updateStatus(item._id, "Acknowledged") }) {
                                        Text("Acknowledge")
                                    }
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                if (item.riskLevel == "MEDIUM" && (item.status == "Pending" || item.status == "Acknowledged")) {
                                    Button(onClick = { viewModel.assignDoctor(item._id) }) {
                                        Text("Assign Doctor")
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
