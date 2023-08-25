/* eslint-disable no-alert */
/* eslint-disable import/named */
/* eslint-disable no-console */
/* eslint-disable arrow-body-style */
import { GoogleAuthProvider } from 'firebase/auth';
import {
  auth,
  createUserWithEmailAndPassword,
  updateProfile,
  provider,
  signInWithPopup,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  addDoc,
  collection,
  db,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  where,
} from './initializeFirebase.js';

export const registerWithEmail = (email, password, username) => {
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      updateProfile(userCredential.user, {
        displayName: username,
      });
      sendEmailVerification(userCredential.user);
      return user;
    });
};
export const signInWithGoogle = () => signInWithPopup(auth, provider)
  .then((result) => {
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    const user = result.user;
    return (token, user);
  });

export const loginWithEmail = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      return (user);
    });
};

export const signOutSession = () => signOut(auth);

export async function createPost(username, titulo, ingredientes, preparacion, timestamp) {
  try {
    const data = {
      author: username,
      title: titulo,
      ingredients: ingredientes,
      preparation: preparacion,
      date: timestamp,
      likes: 0,
      likesArray: [],
    };
    const docPost = await addDoc(collection(db, 'Post'), data);
    console.log('Document written with ID: ', docPost.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
}

export async function displayAllPosts() {
  try {
    const querySnapshot = await getDocs(query(collection(db, 'Post'), orderBy('date', 'desc')));
    const postsSection = document.querySelector('.divRecetasUsers');

    querySnapshot.forEach((file) => {
      const data = file.data();
      const postId = file.id;
      const user = auth.currentUser;

      const postDiv = document.createElement('div');
      postDiv.className = 'post';

      const divUserInfo = document.createElement('div');
      divUserInfo.className = 'divUserInfo';

      const author = document.createElement('p');
      author.textContent = `${data.author}`;
      author.className = 'author';

      const title = document.createElement('p');
      title.textContent = data.title;
      title.className = 'titlePost';

      const ingredients = document.createElement('p');
      ingredients.textContent = data.ingredients;
      ingredients.className = 'ingredients';

      const preparation = document.createElement('p');
      preparation.textContent = data.preparation;
      preparation.className = 'preparation';

      const divEndPost = document.createElement('div');
      divEndPost.className = 'divBtnPost';

      const divReaction = document.createElement('div');
      divReaction.className = 'divReaction';

      const reaction = document.createElement('button');
      reaction.className = 'reactionButton';
      reaction.textContent = `${data.likes} 🧁`;

      divUserInfo.append(author);
      divReaction.append(reaction);
      divEndPost.append(divReaction);
      postDiv.append(divUserInfo, title, ingredients, preparation, divEndPost);
      postsSection.appendChild(postDiv);

      reaction.addEventListener('click', async () => {
        const postRef = doc(db, 'Post', postId);
        const postSnapshot = await getDoc(postRef);
        const postData = postSnapshot.data();

        const userId = user.uid;
        const likesArr = postData.likesArray || [];
        const userLikesPost = likesArr.includes(userId);

        try {
          if (userLikesPost) {
            const getIndexOfUser = likesArr.indexOf(userId);
            likesArr.splice(getIndexOfUser, 1);
          } else {
            likesArr.push(userId);
          }

          const newLikesCount = likesArr.length;

          await updateDoc(postRef, {
            likes: newLikesCount,
            likesArray: likesArr,
          });
          reaction.textContent = `${newLikesCount} 🧁`;
        } catch (error) {
          console.error('Error al actualizar:', error);
        }
      });
    });
  } catch (e) {
    console.error('Error al actualizar: ', e);
  }
}

export async function displayUserPosts(user) {
  try {
    if (user) {
      const querySnapshot = await getDocs(query(collection(db, 'Post'), where('author', '==', user.displayName), orderBy('date', 'desc')));
      const postsSection = document.querySelector('.divRecetasUser');

      querySnapshot.forEach((file) => {
        const data = file.data();
        const postId = file.id;

        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        postDiv.setAttribute('data-post-id', postId);

        const divUserInfo = document.createElement('div');
        divUserInfo.className = 'divUserInfo';

        const author = document.createElement('p');
        author.textContent = `${data.author}`;
        author.className = 'author';

        const title = document.createElement('p');
        title.textContent = data.title;
        title.className = 'titlePost';

        const ingredients = document.createElement('p');
        ingredients.textContent = data.ingredients;
        ingredients.className = 'ingredients';

        const preparation = document.createElement('p');
        preparation.textContent = data.preparation;
        preparation.className = 'preparation';

        const divEndPost = document.createElement('div');
        divEndPost.className = 'divButtom-post';

        const divReaction = document.createElement('div');
        divReaction.className = 'divReaction';

        const reaction = document.createElement('button');
        reaction.className = 'reactionButton';
        reaction.textContent = `${data.likes} 🧁`;
        reaction.addEventListener('click', async () => {
          const postRef = doc(db, 'Post', postId);
          const postSnapshot = await getDoc(postRef);
          const postData = postSnapshot.data();

          const userId = user.uid;
          const likesArr = postData.likesArray || [];
          const userLikesPost = likesArr.includes(userId);

          try {
            if (userLikesPost) {
              const getIndexOfUser = likesArr.indexOf(userId);
              likesArr.splice(getIndexOfUser, 1);
            } else {
              likesArr.push(userId);
            }

            const newLikesCount = likesArr.length;

            await updateDoc(postRef, {
              likes: newLikesCount,
              likesArray: likesArr,
            });
            reaction.textContent = `${newLikesCount} 🧁`;
          } catch (error) {
            console.error('Error updating likes:', error);
          }
        });

        divUserInfo.append(author);
        divReaction.append(reaction);
        divEndPost.append(divReaction);
        postDiv.append(divUserInfo, title, ingredients, preparation, divEndPost);
        postsSection.appendChild(postDiv);
      });
    }
  } catch (e) {
    console.error('Error al actualizar: ', e);
  }
}
