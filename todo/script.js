 var app = angular.module("myApp", []);
    app.controller("myController", function($scope) {
      // Initialize Firebase
     const firebaseConfig = {
        apiKey: "AIzaSyCotzSrU7iRJV685q8uceW5kve4kYGkhWA",
        authDomain: "ka-halaman-505b5.firebaseapp.com",
        projectId: "ka-halaman-505b5",
        storageBucket: "ka-halaman-505b5.appspot.com",
        messagingSenderId: "310047835427",
        appId: "1:310047835427:web:face5a3286c95b10ed3896",
      };

      firebase.initializeApp(firebaseConfig);
      const db = firebase.firestore();



      // Reference to your Firestore collection
      const tasksCollection = db.collection('tasks');

$scope.saveTask = function() {
    console.log("Saving task...");
    // Retrieve all tasks to determine the next available index
    tasksCollection.orderBy('index', 'desc').limit(1).get().then(function(querySnapshot) {
        var nextIndex = 1; // Default index if no tasks exist
        if (!querySnapshot.empty) {
            // If tasks exist, calculate the next index
            nextIndex = querySnapshot.docs[0].data().index + 1;
        }
        // Add the task with the calculated index
        tasksCollection.add({ task_name: $scope.yourTask, status: false, journal: [], index: nextIndex })
            .then(function(docRef) {
                console.log("Document written with ID: ", docRef.id);
                // Clear the input field
                $scope.yourTask = '';
                console.log("Input field cleared.");
                // Manually trigger the digest cycle to update the UI
                $scope.$apply();
            })
            .catch(function(error) {
                console.error("Error adding document: ", error);
            });
    });
};






// Function to delete task
$scope.delete = function(task) {
    tasksCollection.doc(task.id).delete()
        .then(function() {
            console.log("Document successfully deleted!");
            // Remove the task from the $scope.tasks array
            var index = $scope.tasks.findIndex(function(t) {
                return t.id === task.id;
            });
            if (index !== -1) {
                $scope.tasks.splice(index, 1);
                $scope.$apply(); // Apply changes to AngularJS scope
            }
        })
        .catch(function(error) {
            console.error("Error removing document: ", error);
        });
};




      // Function to mark task as finished
$scope.finished = function(task) {
    tasksCollection.doc(task.id).update({ status: !task.status })
      .then(function() {
        console.log("Document successfully updated!");
      })
      .catch(function(error) {
        console.error("Error updating document: ", error);
      });
};


      // Function to open modal
      $scope.openModal = function(task) {
        $scope.selectedTask = task;
        $scope.selectedTaskTitle = ''; // Clear previous journal title
        $scope.selectedTaskDetails = ''; // Clear previous journal entry
        $scope.selectedJournalIndex = null; // Reset selectedJournalIndex
        $('#taskModal').modal('show');
      };

$scope.saveJournal = function(task, title, journalEntry) {
    if ($scope.selectedJournalIndex === null) {
        // If selectedJournalIndex is null, it means we are adding a new journal entry
        task.journal.push({ title: title, entry: journalEntry, timestamp: new Date() });
    } else {
        // If selectedJournalIndex is set, it means we are editing an existing journal entry
        task.journal[$scope.selectedJournalIndex] = { title: title, entry: journalEntry, timestamp: new Date() };
        $scope.selectedJournalIndex = null; // Reset selectedJournalIndex after saving
    }
    tasksCollection.doc(task.id).update(task)
        .then(function() {
            console.log("Document successfully updated!");
            // Clear the input fields
            $scope.selectedTaskTitle = '';
            $scope.selectedTaskDetails = '';
            console.log("Input fields cleared.");
            // Manually trigger the digest cycle to update the UI
            $scope.$apply();
        })
        .catch(function(error) {
            console.error("Error updating document: ", error);
        });
    // Do not hide the modal after saving
};


  // Function to edit journal
$scope.editJournal = function(journal, index) {
    $scope.selectedTaskTitle = journal.title;
    $scope.selectedTaskDetails = journal.entry;
    $scope.selectedJournalIndex = index;
    $('#taskModal').modal('show'); // Show the modal for editing
};

// Function to delete journal
$scope.deleteJournal = function(index) {
    if (confirm("Are you sure you want to delete this journal entry?")) {
        $scope.selectedTask.journal.splice(index, 1);
        tasksCollection.doc($scope.selectedTask.id).update({ journal: $scope.selectedTask.journal })
            .then(function() {
                console.log("Document successfully updated!");
            })
            .catch(function(error) {
                console.error("Error updating document: ", error);
            });
    }
};

      
$scope.getTasks = function() {
    tasksCollection.orderBy('index').onSnapshot(function(querySnapshot) {
        $scope.tasks = [];
        querySnapshot.forEach(function(doc) {
            // Include the document ID in the task object
            var task = doc.data();
            task.id = doc.id;
            $scope.tasks.push(task);
        });
        $scope.$apply(); // Apply changes to AngularJS scope
    });
};



// Call the function to get tasks when the controller initializes
$scope.getTasks();

    });