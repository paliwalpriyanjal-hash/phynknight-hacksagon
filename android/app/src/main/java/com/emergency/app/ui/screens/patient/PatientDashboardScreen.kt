package com.emergency.app.ui.screens.patient

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
fun PatientDashboardScreen(viewModel: MainViewModel) {
    LaunchedEffect(Unit) {
        while (true) {
            viewModel.fetchPatientData()
            delay(5000)
        }
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("My Emergencies", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))

        if (viewModel.isLoading.value && viewModel.emergencies.value.isEmpty()) {
            CircularProgressIndicator()
        } else {
            LazyColumn {
                items(viewModel.emergencies.value) { item ->
                    Card(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("Patient: ${item.name}", style = MaterialTheme.typography.titleMedium)
                            Text("Status: ${item.status}", color = MaterialTheme.colorScheme.primary)
                        }
                    }
                }
            }
        }
    }
}
