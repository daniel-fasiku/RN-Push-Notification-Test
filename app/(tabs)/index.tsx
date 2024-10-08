import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert} from 'react-native';
import { usePushNotifications } from '../usePushNotifications';
import axios from 'axios';

// Define the types for notes and comments
interface Comment {
  _id: string;
  content: string;
  author: string;
}

interface Note {
  _id: string;
  content: string;
  author: string;
  comments: Comment[];
}


const API_URL = 'https://push-utq8.onrender.com'; // Replace with your server's IP and port

const NotesScreen: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState<string>('');
  const [newComment, setNewComment] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const { expoPushToken, notification } = usePushNotifications();
  const data = JSON.stringify(notification, undefined, 2);

  const fetchNotes = async (): Promise<void> => {
    try {
      const response = await axios.get(`${API_URL}/notes`);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
      Alert.alert('Error', 'Failed to fetch notes. Please try again.');
    }
  };

  const createNote = async (): Promise<void> => {
    if (newNote.trim() === '') return;
    if (username.trim() === '') {
      Alert.alert('Error', 'Please enter a username');
      return;
    }
    try {
      await axios.post(`${API_URL}/notes`, {
        content: newNote,
        author: username,
        authorFcmToken: expoPushToken?.data ?? ""
      });

      setNewNote('');
      fetchNotes(); // Refresh the notes list
    } catch (error) {
      console.error('Error creating note:', error);
      Alert.alert('Error', 'Failed to create note. Please try again.');
    }
  };

  const addComment = async (noteId: string): Promise<void> => {
    if (newComment.trim() === '') return;
    if (username.trim() === '') {
      Alert.alert('Error', 'Please enter a username');
      return;
    }
    try {
      await axios.post(`${API_URL}/notes/${noteId}/comments`, {
        content: newComment,
        author: username,
      });
      setNewComment('');
      fetchNotes(); // Refresh the notes list
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    }
  };

  const renderNote = ({ item }: { item: Note }) => (
    <View style={styles.noteItem}>
      <Text style={styles.noteContent}>{item.content}</Text>
      <Text style={styles.noteAuthor}>By: {item.author}</Text>
      <Text style={styles.commentCount}>Comments: {item.comments.length}</Text>
      <FlatList
        data={item.comments}
        renderItem={({ item: comment }: { item: Comment }) => (
          <View style={styles.commentItem}>
            <Text>{comment.content}</Text>
            <Text style={styles.commentAuthor}>By: {comment.author}</Text>
          </View>
        )}
        keyExtractor={(comment) => comment._id}
      />
      <TextInput
        style={styles.input}
        value={newComment}
        onChangeText={setNewComment}
        placeholder="Add a comment"
      />
      <Button title="Add Comment" onPress={() => addComment(item._id)} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text>Token: {expoPushToken?.data ?? ""} </Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Enter your username"
      />
      <TextInput
        style={styles.input}
        value={newNote}
        onChangeText={setNewNote}
        placeholder="Enter a new note"
      />
      <Button title="Create Note" onPress={createNote} />
      <FlatList
        data={notes}
        renderItem={renderNote}
        keyExtractor={(item) => item._id}
        style={styles.list}
      />
    </View>
  );
};

export default NotesScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 30
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  list: {
    marginTop: 20,
  },
  noteItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 15,
  },
  noteContent: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteAuthor: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
  },
  commentCount: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
  },
  commentItem: {
    padding: 5,
    marginLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#ccc',
  },
  commentAuthor: {
    fontSize: 10,
    color: 'gray',
  },
});
