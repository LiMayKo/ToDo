// script.js

var app = angular.module("myApp", []);

app.controller("myController", function($scope) {
    // Initialize Firebase
      const firebaseConfig = {
    apiKey: "AIzaSyCotzSrU7iRJV685q8uceW5kve4kYGkhWA",
    authDomain: "ka-halaman-505b5.firebaseapp.com",
    projectId: "ka-halaman-505b5",
    storageBucket: "ka-halaman-505b5.appspot.com",
    messagingSenderId: "310047835427",
    appId: "1:310047835427:web:face5a3286c95b10ed3896"
  };

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // Initialize an empty array to store todo items
    $scope.todos = [];

    // Initialize a newTodo object to store data from the modal form
    $scope.newTodo = {};

    // Function to open the Add Todo modal
    $scope.openModal = function() {
        $('#addTodoModal').modal('show');
    };

// Function to add a new todo item
$scope.addTodo = function() {
    if ($scope.newTodo.title && $scope.newTodo.taskType && $scope.newTodo.dueDate && $scope.newTodo.cost) {
        // If all required fields are filled, add the todo to Firestore
        db.collection("todos").add({
            title: $scope.newTodo.title,
            taskType: $scope.newTodo.taskType === '' ? $scope.newTaskType : $scope.newTodo.taskType,
            dueDate: $scope.newTodo.dueDate,
            cost: $scope.newTodo.cost,
            completed: false // Default to incomplete
        })
        .then(function(docRef) {
    console.log("Document written with ID: ", docRef.id);
    // Add the new todo directly to the todos array
    $scope.todos.push({
        id: docRef.id, // Include the document ID
        title: $scope.newTodo.title,
        taskType: $scope.newTodo.taskType === '' ? $scope.newTaskType : $scope.newTodo.taskType,
        dueDate: $scope.newTodo.dueDate,
        cost: $scope.newTodo.cost,
        completed: false // Default to incomplete
    });
    // Clear the newTodo object and close the modal
    $scope.newTodo = {};
    $('#addTodoModal').modal('hide');
    $scope.$apply(); // Force AngularJS to update the view
})

        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
    } else {
        alert('Please fill in all fields.');
    }
};


  // Function to retrieve todo items from Firestore
$scope.getTodos = function() {
    db.collection("todos").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            var todo = doc.data();
            todo.id = doc.id; // Add the document ID as a property of the todo item
            $scope.todos.push(todo);
        });
        $scope.$apply(); // Apply changes to AngularJS scope
    });
};


// Call the function to retrieve todos when the controller initializes
$scope.getTodos();

// Function to get the due date display
$scope.getDueDateDisplay = function(dueDate) {
    var today = new Date();
    var due = new Date(dueDate);
    var timeDiff = due.getTime() - today.getTime();
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (diffDays === 0) {
        return "Today";
    } else if (diffDays === 1) {
        return "Tomorrow";
    } else if (diffDays > 1) {
        return "Due in " + diffDays + " days";
    } else {
        return "Overdue";
    }
};

 // Initialize Hammer for swipe gestures
    var todoList = document.getElementById('todoList');
    var hammer = new Hammer(todoList);

    // Handle swipe left event
    hammer.on('swipeleft', function(event) {
        // Get the todo item corresponding to the swipe
        var todoIndex = event.target.closest('tr').dataset.index;
        var todo = $scope.todos[todoIndex];

        // Show the delete button for the swiped todo item
        todo.showDeleteButton = true;
        $scope.$apply();
    });

    // Function to hide the delete button
    $scope.hideDeleteButton = function(todo) {
        todo.showDeleteButton = false;
    };

    $scope.deleteTodo = function(todo) {
    if (confirm("Are you sure you want to delete this todo?")) {
        // Remove the todo item from the array
        var index = $scope.todos.indexOf(todo);
        if (index !== -1) {
            $scope.todos.splice(index, 1);
        }

        // Delete the todo item from Firestore
        db.collection("todos").doc(todo.id).delete()
            .then(function() {
                console.log("Todo successfully deleted from Firestore!");
            })
            .catch(function(error) {
                console.error("Error deleting todo from Firestore: ", error);
            });
    }
};


// Initialize sorting options
$scope.sortColumn = null;
$scope.reverse = false;

// Function to sort todos based on a specific column
$scope.sortBy = function(column) {
    if ($scope.sortColumn === column) {
        // If already sorted by this column, reverse the order
        $scope.reverse = !$scope.reverse;
    } else {
        // Otherwise, sort by the new column in ascending order
        $scope.sortColumn = column;
        $scope.reverse = false;
    }

    // Sort the todos array based on the selected column and order
    $scope.todos.sort(function(a, b) {
        var valueA = a[$scope.sortColumn];
        var valueB = b[$scope.sortColumn];

        // If sorting by dueDate, convert to Date objects for comparison
        if ($scope.sortColumn === 'dueDate') {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
        }

        if ($scope.reverse) {
            return valueB < valueA ? -1 : valueB > valueA ? 1 : 0;
        } else {
            return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        }
    });
};

});
